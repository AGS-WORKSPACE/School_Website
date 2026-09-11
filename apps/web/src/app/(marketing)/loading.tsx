import { Skeleton } from "@tau/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-site pb-24 pt-40" role="status" aria-label="Loading page">
      <div className="space-y-3">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-12 w-full max-w-2xl rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-xl rounded-xl" />
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-border p-5">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <Skeleton className="mt-4 h-5 w-3/4 rounded-lg" />
            <Skeleton className="mt-2 h-4 w-full rounded-lg" />
            <Skeleton className="mt-2 h-4 w-2/3 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
