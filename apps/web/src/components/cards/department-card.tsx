import Link from "next/link";
import { ArrowRight, Building2, UserRound } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import type { Department } from "@/types";

export function DepartmentCard({ department }: { department: Department }) {
  return (
    <Card className="group flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
          <Building2 className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-display text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
          {department.name}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {department.description}
        </p>
        <div className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <UserRound className="size-3.5 text-medical" aria-hidden="true" />
            Head: <span className="font-semibold text-foreground">{department.head}</span>
          </p>
          <p className="text-xs">
            {department.programmes.length} programmes · {department.staffCount} academic staff
          </p>
        </div>
        <Link
          href={`/departments/${department.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          View Department
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
