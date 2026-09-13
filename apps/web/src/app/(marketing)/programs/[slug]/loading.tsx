import { Skeleton } from "@tau/ui/skeleton";

export default function ProgrammeLoading() {
  return (
    <div className="container-site pb-24 pt-40" role="status" aria-label="Loading programme">
      <Skeleton className="h-6 w-40 rounded-full" />
      <Skeleton className="mt-5 h-12 w-full max-w-3xl rounded-2xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl rounded-xl" />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
