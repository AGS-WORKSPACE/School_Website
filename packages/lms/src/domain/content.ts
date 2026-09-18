/**
 * Course materials with size labels, text alternatives and accessibility
 * metadata (LMS-03, LMS-05), plus learner progress that survives interruption.
 */

export type ContentKind = "Page" | "Reading" | "Slides" | "Video" | "Audio" | "Quiz" | "Link";

export type ContentFormat = "HTML" | "Tagged_PDF" | "Scanned_PDF" | "DOCX" | "PPTX" | "MP4" | "MP3" | "QTI" | "External";

export type AlternativeKind = "Captions" | "Transcript" | "Audio_Only" | "Low_Res_Video" | "Text_Summary";

export interface ContentAlternative {
  kind: AlternativeKind;
  sizeBytes: number;
}

export interface ContentItem {
  id: string;
  offeringId: string;
  module: string;
  title: string;
  kind: ContentKind;
  format: ContentFormat;
  sizeBytes: number;
  /** Essential items must stay usable without video or a fast connection. */
  essential: boolean;
  alternatives: ContentAlternative[];
  /** Images and slides: every meaningful image has alternative text. */
  altTextComplete?: boolean;
  outcomeIds: string[];
}

export interface ProgressEntry {
  studentId: string;
  itemId: string;
  percent: number;
  completed: boolean;
  updatedAt: string;
  /** Monotonic per device, so a replayed queue can be recognised. */
  deviceId: string;
  sequence: number;
}
