import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex shrink-0 rounded-lg bg-navy px-2 py-1">
            <Image src="/brand/nau-logo.png" alt="Nnamdi Azikiwe University" width={300} height={80} priority className="h-10 w-auto" />
          </span>
          <div>
            <p className="font-display text-base font-semibold">Identity and Access</p>
            <p className="text-muted-foreground text-xs">Nnamdi Azikiwe University</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
