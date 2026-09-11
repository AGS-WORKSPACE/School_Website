export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground font-display grid size-10 shrink-0 place-items-center rounded-lg text-sm font-bold">
            TAU
          </span>
          <div>
            <p className="font-display text-base font-semibold">Identity and Access</p>
            <p className="text-muted-foreground text-xs">Thomas Adewumi University</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
