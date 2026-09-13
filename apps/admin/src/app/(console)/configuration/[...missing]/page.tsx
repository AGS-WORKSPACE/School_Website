import Link from "next/link";
import { RouteOff } from "lucide-react";
import { Button } from "@tau/ui/button";

export default function ConfigurationNotFoundPage() {
  return <div className="grid min-h-[55vh] place-items-center"><div className="max-w-md text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground"><RouteOff className="size-6" /></span><h1 className="mt-5 font-display text-2xl font-extrabold">Configuration page not found</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">The requested Epic 2 route does not exist or has moved.</p><Button asChild className="mt-5"><Link href="/configuration">Back to configuration overview</Link></Button></div></div>;
}
