import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * A plain `<select>` in the platform's clothing.
 *
 * Preferred over a custom listbox for administrative forms: it is keyboard and
 * screen-reader correct for free, and on the low-end Android devices the
 * platform targets it opens the native picker instead of a scrolling div.
 */
const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full appearance-none rounded-lg border px-3 py-2 pr-9 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      aria-hidden
    />
  </div>
));
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
