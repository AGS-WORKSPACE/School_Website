"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@tau/ui/dialog";
import { Badge } from "@tau/ui/badge";
import type { GalleryImage } from "@/types";

export function Gallery({
  images,
  className,
  columns = 3,
}: {
  images: GalleryImage[];
  className?: string;
  columns?: 2 | 3 | 4;
}) {
  const [active, setActive] = useState<GalleryImage | null>(null);

  const gridClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <>
      <div className={cn("grid grid-cols-1 gap-6", gridClass, className)}>
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActive(image)}
            aria-label={`View ${image.alt}`}
            className={cn(
              "group relative overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              index % 3 === 0 && columns === 3 ? "lg:row-span-1" : "",
            )}
          >
            <PlaceholderImage src={image.src} alt={image.alt} aspect="square" className="rounded-none" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy/90 via-navy/20 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <Badge variant="accent" className="mb-2 w-fit">{image.category}</Badge>
              {image.caption ? <span className="text-sm font-semibold text-white">{image.caption}</span> : null}
              <span className="text-xs text-white/70">{image.alt}</span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-3xl">
          {active ? (
            <>
              <PlaceholderImage src={active.src} alt={active.alt} aspect="video" className="rounded-none" />
              <div className="p-6">
                <DialogTitle>{active.caption ?? active.alt}</DialogTitle>
                <DialogDescription className="mt-1">{active.alt}</DialogDescription>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
