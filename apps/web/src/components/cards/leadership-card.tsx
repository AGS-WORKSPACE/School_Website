import { Avatar, AvatarFallback } from "@tau/ui/avatar";
import { Badge } from "@tau/ui/badge";
import { Card, CardContent } from "@tau/ui/card";
import { Mail } from "lucide-react";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import type { LeadershipMember } from "@/types";

export function LeadershipCard({ member }: { member: LeadershipMember }) {
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <Card className="group overflow-hidden text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative">
        {member.image ? (
          <PlaceholderImage src={member.image} alt={member.name} aspect="portrait" className="rounded-none" />
        ) : (
          <div className="flex aspect-[3/2] items-center justify-center bg-gradient-to-br from-navy to-medical">
            <Avatar className="size-20 border-4 border-white/20">
              <AvatarFallback className="bg-white/10 text-2xl font-bold text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      </div>
      <CardContent className="p-6">
        <h3 className="font-display text-lg font-bold tracking-tight">{member.name}</h3>
        <p className="mt-1 text-sm font-semibold text-medical">{member.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{member.department}</p>
        <div className="mt-3">
          <Badge variant="muted" className="whitespace-normal">{member.credentials}</Badge>
        </div>
        <p className="mt-4 line-clamp-4 text-left text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
        <a
          href={`mailto:${member.email}`}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <Mail className="size-3.5" aria-hidden="true" />
          {member.email}
        </a>
      </CardContent>
    </Card>
  );
}
