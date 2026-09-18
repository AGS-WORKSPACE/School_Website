/**
 * Low-bandwidth delivery (LMS-03) and accessibility checks (LMS-05) for course
 * materials, plus progress merging that survives interrupted connections.
 */

import type { ContentItem, ProgressEntry } from "../domain/content";

/** An essential item above this size needs a lighter alternative. */
export const essentialSizeLimitBytes = 20 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

const textAlternatives = ["Transcript", "Text_Summary"] as const;

function hasAlternative(item: ContentItem, kinds: readonly string[]): boolean {
  return item.alternatives.some((alternative) => kinds.includes(alternative.kind));
}

/** The smallest representation a learner can use in place of the full item. */
export function lightestSize(item: ContentItem): number {
  const usable = item.alternatives.filter((alternative) => alternative.kind !== "Captions");
  return Math.min(item.sizeBytes, ...usable.map((alternative) => alternative.sizeBytes));
}

export function lowBandwidthIssues(item: ContentItem): string[] {
  const issues: string[] = [];
  if (!item.essential) return issues;
  if (item.kind === "Video" && !hasAlternative(item, textAlternatives)) issues.push("Essential video has no transcript or text summary, so it cannot be completed without video.");
  if (lightestSize(item) > essentialSizeLimitBytes) issues.push(`Essential item is ${formatBytes(item.sizeBytes)} with no alternative under ${formatBytes(essentialSizeLimitBytes)}.`);
  return issues;
}

export function accessibilityIssues(item: ContentItem): string[] {
  const issues: string[] = [];
  if (item.kind === "Video") {
    if (!hasAlternative(item, ["Captions"])) issues.push("Video has no captions.");
    if (!hasAlternative(item, ["Transcript"])) issues.push("Video has no transcript.");
  }
  if (item.kind === "Audio" && !hasAlternative(item, ["Transcript"])) issues.push("Audio has no transcript.");
  if (item.format === "Scanned_PDF") issues.push("Scanned PDF is not readable by screen readers; provide a tagged PDF or HTML version.");
  if (item.altTextComplete === false) issues.push("Some images have no alternative text.");
  return issues;
}

export interface ContentReport {
  items: number;
  totalBytes: number;
  lowBandwidthBytes: number;
  accessibilityIssueCount: number;
  lowBandwidthIssueCount: number;
  passes: boolean;
}

export function contentReport(items: ContentItem[]): ContentReport {
  const accessibilityIssueCount = items.reduce((sum, item) => sum + accessibilityIssues(item).length, 0);
  const lowBandwidthIssueCount = items.reduce((sum, item) => sum + lowBandwidthIssues(item).length, 0);
  return {
    items: items.length,
    totalBytes: items.reduce((sum, item) => sum + item.sizeBytes, 0),
    lowBandwidthBytes: items.reduce((sum, item) => sum + lightestSize(item), 0),
    accessibilityIssueCount,
    lowBandwidthIssueCount,
    passes: accessibilityIssueCount === 0 && lowBandwidthIssueCount === 0,
  };
}

/**
 * Merges queued progress from a device that was offline. Progress never goes
 * backwards and completion is sticky, so a replayed or out-of-order queue
 * cannot undo work that already reached the server.
 */
export function mergeProgress(server: ProgressEntry[], incoming: ProgressEntry[]): { entries: ProgressEntry[]; applied: number; ignored: number } {
  const merged = new Map(server.map((entry) => [`${entry.studentId}|${entry.itemId}`, entry]));
  let applied = 0;
  let ignored = 0;
  for (const entry of [...incoming].sort((a, b) => a.sequence - b.sequence)) {
    const key = `${entry.studentId}|${entry.itemId}`;
    const existing = merged.get(key);
    const advances = !existing || entry.percent > existing.percent || (entry.completed && !existing.completed);
    if (!advances) {
      ignored++;
      continue;
    }
    merged.set(key, {
      ...entry,
      percent: Math.max(entry.percent, existing?.percent ?? 0),
      completed: entry.completed || Boolean(existing?.completed),
    });
    applied++;
  }
  return { entries: [...merged.values()], applied, ignored };
}
