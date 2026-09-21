"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

type BannerSlide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  linkUrl: string | null;
};

const AUTO_ADVANCE_MS = 6000;

export function BannerCarousel({ banners }: { banners: BannerSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => setCurrent(((index % banners.length) + banners.length) % banners.length),
    [banners.length]
  );

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [banners.length, paused]);

  return (
    <div
      className="relative h-[26rem] w-full overflow-hidden sm:h-[32rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          aria-hidden={index !== current}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            index === current ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={banner.image}
            alt={banner.title ?? "Promotion"}
            fill
            sizes="100vw"
            className={`object-cover transition-transform duration-[6000ms] ease-out ${
              index === current ? "scale-105" : "scale-100"
            }`}
            priority={index === 0}
          />
          {/* Scrim: keeps the headline readable over any uploaded photo. */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/92 via-ink-950/70 to-ink-950/25" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col items-start justify-center gap-5 px-6 sm:px-8">
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {banner.title ?? "Genuine Parts for Every Ride"}
            </h1>
            {banner.subtitle ? (
              <p className="max-w-lg text-base leading-relaxed text-ink-300 sm:text-lg">
                {banner.subtitle}
              </p>
            ) : null}
            <Link
              href={banner.linkUrl ?? "/products"}
              className={buttonClasses("primary", "xl", "mt-1")}
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}

      {banners.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === current ? "w-8 bg-brand-500" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
