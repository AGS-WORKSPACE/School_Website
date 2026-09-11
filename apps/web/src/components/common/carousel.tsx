"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  slidesToShow?: number;
  loop?: boolean;
  align?: "start" | "center" | "end";
  showControls?: boolean;
  showDots?: boolean;
  ariaLabel?: string;
}

export function Carousel({
  children,
  className,
  autoplay = false,
  autoplayDelay = 5000,
  loop = true,
  align = "center",
  showControls = true,
  showDots = false,
  ariaLabel = "Carousel",
}: CarouselProps) {
  const slides = Array.isArray(children) ? children : [children];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop, align, containScroll: "trimSnaps" },
    autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : [],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const frame = window.requestAnimationFrame(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      window.cancelAnimationFrame(frame);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={cn("relative", className)} role="region" aria-label={ariaLabel}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <div key={index} className="min-w-0 flex-[0_0_100%] sm:px-3 md:flex-[0_0_calc(100%/2)] lg:flex-[0_0_calc(100%/3)]">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showControls ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev && !loop}
            aria-label="Previous slide"
            className="flex size-11 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition-all hover:bg-medical hover:text-white hover:border-medical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          {showDots ? (
            <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={selectedIndex === index}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedIndex === index ? "w-8 bg-medical" : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                />
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext && !loop}
            aria-label="Next slide"
            className="flex size-11 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition-all hover:bg-medical hover:text-white hover:border-medical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {showDots && !showControls ? (
        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Slide indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={selectedIndex === index}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selectedIndex === index ? "w-8 bg-medical" : "w-2.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
