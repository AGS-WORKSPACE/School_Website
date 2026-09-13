import { can, computeEffectiveGrants } from "@tau/identity";
import { getStore } from "@tau/identity/mock";

export type EditorialStatus =
  | "draft"
  | "pending-approval"
  | "approved"
  | "scheduled"
  | "published"
  | "expired"
  | "rolled-back";

export type EditorialContentType = "page" | "news" | "announcement" | "event" | "emergency-banner";

export interface EditorialApproval {
  approvedBy: string | null;
  approvedAt: string | null;
  reviewNote: string | null;
}

export interface EditorialContentItem {
  id: string;
  title: string;
  type: EditorialContentType;
  owner: string;
  status: EditorialStatus;
  summary: string;
  previewPath: string;
  scheduledPublishAt: string | null;
  reviewDate: string | null;
  expiresAt: string | null;
  startsAt?: string | null;
  severity?: "info" | "warning" | "critical";
  cta?: { label: string; href: string } | null;
  approval: EditorialApproval;
  updatedAt: string;
  version: number;
  isPublic: boolean;
}

export interface EditorialHistoryEntry {
  id: string;
  status: EditorialStatus;
  actor: string;
  at: string;
  note: string;
}

const items: EditorialContentItem[] = [
  {
    id: "content-news-simulation-centre",
    title: "TAU Opens Advanced Clinical Simulation Centre",
    type: "news",
    owner: "Communications Office",
    status: "published",
    summary: "Published news article with a current public version.",
    previewPath: "/news/tau-opens-advanced-simulation-centre",
    scheduledPublishAt: null,
    reviewDate: "2026-09-30",
    expiresAt: null,
    approval: { approvedBy: "David Ojo", approvedAt: "2026-06-13T10:00:00Z", reviewNote: "Approved for public release." },
    updatedAt: "2026-06-14T08:00:00Z",
    version: 3,
    isPublic: true,
  },
  {
    id: "content-announcement-applications",
    title: "2026/2027 undergraduate applications are open",
    type: "announcement",
    owner: "Admissions Office",
    status: "scheduled",
    summary: "Approved announcement waiting for its scheduled publication time.",
    previewPath: "/announcements/2026-2027-undergraduate-applications-open",
    scheduledPublishAt: "2026-09-20T08:00:00Z",
    reviewDate: "2026-09-15",
    expiresAt: "2026-12-31",
    approval: { approvedBy: "David Ojo", approvedAt: "2026-09-10T12:00:00Z", reviewNote: "Dates checked with Admissions." },
    updatedAt: "2026-09-10T12:00:00Z",
    version: 2,
    isPublic: false,
  },
  {
    id: "content-event-research-symposium",
    title: "Annual Public Health Research Symposium",
    type: "event",
    owner: "Research Office",
    status: "pending-approval",
    summary: "Event copy staged by an editor and waiting for an approver.",
    previewPath: "/events/public-health-research-symposium",
    scheduledPublishAt: null,
    reviewDate: "2026-09-14",
    expiresAt: "2026-11-13",
    approval: { approvedBy: null, approvedAt: null, reviewNote: null },
    updatedAt: "2026-09-11T09:30:00Z",
    version: 1,
    isPublic: false,
  },
  {
    id: "content-page-scholarships",
    title: "International Student Scholarships",
    type: "page",
    owner: "International Office",
    status: "draft",
    summary: "Working copy that must not appear on the public website.",
    previewPath: "/international/scholarships",
    scheduledPublishAt: null,
    reviewDate: null,
    expiresAt: null,
    approval: { approvedBy: null, approvedAt: null, reviewNote: null },
    updatedAt: "2026-09-12T08:15:00Z",
    version: 4,
    isPublic: false,
  },
  {
    id: "content-banner-maintenance",
    title: "Main campus maintenance notice",
    type: "emergency-banner",
    owner: "Facilities Office",
    status: "expired",
    summary: "Expired banner retained for editorial history and audit review.",
    previewPath: "/",
    scheduledPublishAt: null,
    reviewDate: "2026-08-01",
    expiresAt: "2026-08-31T23:59:59Z",
    startsAt: "2026-08-01T07:00:00Z",
    severity: "warning",
    cta: { label: "Read maintenance notice", href: "/announcements/2026-campus-maintenance-notice" },
    approval: { approvedBy: "David Ojo", approvedAt: "2026-08-01T07:00:00Z", reviewNote: "Approved with mandatory expiry." },
    updatedAt: "2026-08-31T23:59:59Z",
    version: 2,
    isPublic: false,
  },
  {
    id: "content-news-rollback",
    title: "Research partnership announcement",
    type: "news",
    owner: "Communications Office",
    status: "rolled-back",
    summary: "Previously published version withdrawn and retained for history.",
    previewPath: "/news/research-partnership-announcement",
    scheduledPublishAt: null,
    reviewDate: "2026-09-05",
    expiresAt: null,
    approval: { approvedBy: "David Ojo", approvedAt: "2026-08-25T11:00:00Z", reviewNote: "Rolled back pending factual review." },
    updatedAt: "2026-09-05T14:00:00Z",
    version: 5,
    isPublic: false,
  },
];

const history = new Map<string, EditorialHistoryEntry[]>(
  items.map((item) => [item.id, [
    { id: `${item.id}-created`, status: "draft", actor: item.owner, at: item.updatedAt, note: "Content version created." },
    ...(item.status === "published" ? [{ id: `${item.id}-published`, status: "published" as const, actor: item.approval.approvedBy ?? "System", at: item.updatedAt, note: "Released to the public website." }] : []),
  ]]),
);

function clone<T>(value: T): T {
  return structuredClone(value);
}

export async function getEditorialContent(): Promise<EditorialContentItem[]> {
  return clone(items);
}

export async function getEditorialHistory(contentId: string): Promise<EditorialHistoryEntry[]> {
  return clone(history.get(contentId) ?? []);
}

async function authorised(actorPersonId: string, permissionId: "content:page:draft" | "content:page:publish") {
  const store = await getStore();
  const grants = computeEffectiveGrants({
    personId: actorPersonId,
    now: new Date(),
    units: store.units,
    assignments: store.assignments,
    delegations: store.delegations,
    breakGlassGrants: store.breakGlassGrants,
  });
  return can({
    grants,
    permissionId,
    targetScope: { dimension: "institution", unitId: "inst-tau" },
    units: store.units,
    mfaSatisfied: true,
    now: new Date(),
  }).allowed;
}

type MutationResult = { ok: boolean; message: string; data?: EditorialContentItem };

async function transition(input: {
  contentId: string;
  actorPersonId: string;
  permission: "content:page:draft" | "content:page:publish";
  from: EditorialStatus[];
  to: EditorialStatus;
  note: string;
  scheduledPublishAt?: string | null;
}): Promise<MutationResult> {
  if (!(await authorised(input.actorPersonId, input.permission))) {
    return { ok: false, message: "The policy engine denied this editorial action." };
  }
  const item = items.find((candidate) => candidate.id === input.contentId);
  if (!item) return { ok: false, message: "Content item not found." };
  if (!input.from.includes(item.status)) return { ok: false, message: `Content is ${item.status}; this transition is not available.` };
  if (item.type === "emergency-banner" && ["approved", "scheduled", "published"].includes(input.to) && !item.expiresAt) {
    return { ok: false, message: "Emergency banners require an expiry date before approval or publication." };
  }
  item.status = input.to;
  item.isPublic = input.to === "published";
  item.updatedAt = new Date().toISOString();
  item.version += 1;
  if (input.scheduledPublishAt !== undefined) item.scheduledPublishAt = input.scheduledPublishAt;
  const actor = input.actorPersonId === "per-david" ? "David Ojo" : input.actorPersonId;
  const entry = { id: `${item.id}-${item.version}`, status: input.to, actor, at: item.updatedAt, note: input.note };
  history.set(item.id, [...(history.get(item.id) ?? []), entry]);
  return { ok: true, message: `Content marked ${input.to}.`, data: clone(item) };
}

export const editorialWorkflow = {
  submitForApproval: (contentId: string, actorPersonId: string) => transition({ contentId, actorPersonId, permission: "content:page:draft", from: ["draft", "rolled-back"], to: "pending-approval", note: "Submitted for approval." }),
  approve: (contentId: string, actorPersonId: string, reviewNote: string) => transition({ contentId, actorPersonId, permission: "content:page:publish", from: ["pending-approval"], to: "approved", note: reviewNote || "Approved for publication." }),
  publish: (contentId: string, actorPersonId: string) => transition({ contentId, actorPersonId, permission: "content:page:publish", from: ["approved"], to: "published", note: "Published to the public website." }),
  schedule: (contentId: string, actorPersonId: string, scheduledPublishAt: string) => transition({ contentId, actorPersonId, permission: "content:page:publish", from: ["approved"], to: "scheduled", scheduledPublishAt, note: `Scheduled for ${scheduledPublishAt}.` }),
  rollback: (contentId: string, actorPersonId: string) => transition({ contentId, actorPersonId, permission: "content:page:publish", from: ["published", "expired"], to: "rolled-back", note: "Rolled back from public release." }),
};
