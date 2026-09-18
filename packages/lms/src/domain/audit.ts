export interface LmsAuditEntry {
  id: string;
  entity: "Roster" | "Shell" | "Content" | "Community" | "Grade" | "Passback" | "Integration";
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  at: string;
  detail: string;
}
