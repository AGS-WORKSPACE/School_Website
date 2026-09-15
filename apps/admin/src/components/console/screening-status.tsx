import { Badge } from "@tau/ui/badge";
import type { EvidenceStatus, EligibilityStatus, ReviewStatus, ScreeningStatus } from "@tau/admissions";

type ScreeningState = EvidenceStatus | EligibilityStatus | ReviewStatus | ScreeningStatus;

const labels: Record<ScreeningState, string> = {
  Required: "Required",
  Submitted: "Submitted",
  Verified: "Verified",
  Missing: "Missing",
  Rejected: "Rejected",
  Pending_Verification: "Pending verification",
  Not_Assessed: "Not assessed",
  Eligible: "Eligible",
  Ineligible: "Ineligible",
  Needs_Review: "Needs review",
  Not_Started: "Not started",
  In_Review: "In review",
  Completed: "Completed",
  Returned: "Returned",
  Unassigned: "Unassigned",
  Assigned: "Assigned",
  Ready_For_Decision: "Ready for decision",
  Decision_Recorded: "Decision recorded",
};

const variants: Record<ScreeningState, "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "muted"> = {
  Required: "outline",
  Submitted: "secondary",
  Verified: "success",
  Missing: "destructive",
  Rejected: "destructive",
  Pending_Verification: "warning",
  Not_Assessed: "muted",
  Eligible: "success",
  Ineligible: "destructive",
  Needs_Review: "warning",
  Not_Started: "muted",
  In_Review: "warning",
  Completed: "success",
  Returned: "destructive",
  Unassigned: "muted",
  Assigned: "secondary",
  Ready_For_Decision: "warning",
  Decision_Recorded: "success",
};

export function ScreeningStatusBadge({ status }: { status: ScreeningState }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}