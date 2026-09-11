import { Avatar, AvatarFallback } from "@tau/ui/avatar";
import { Badge } from "@tau/ui/badge";
import { Card, CardContent } from "@tau/ui/card";
import { Mail } from "lucide-react";
import type { StaffMember } from "@/types";

export function StaffCard({ staff }: { staff: StaffMember }) {
  const initials = staff.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <Card className="group text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <CardContent className="p-6">
        <Avatar className="mx-auto mb-4 size-20 border-4 border-medical/10 transition-colors group-hover:border-medical/30">
          <AvatarFallback className="bg-medical/10 text-lg font-bold text-medical">{initials}</AvatarFallback>
        </Avatar>
        <h3 className="font-display text-lg font-bold tracking-tight">{staff.name}</h3>
        <p className="mt-1 text-sm font-semibold text-medical">{staff.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{staff.department}</p>
        <div className="mt-3">
          <Badge variant="muted">{staff.specialisation}</Badge>
        </div>
        <a
          href={`mailto:${staff.email}`}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <Mail className="size-3.5" aria-hidden="true" />
          {staff.email}
        </a>
      </CardContent>
    </Card>
  );
}
