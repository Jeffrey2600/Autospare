"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      className="relative h-72 w-full overflow-hidden sm:h-96"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          aria-hidden={index !== current}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={banner.image}
            alt={banner.title ?? "Promotion"}
            fill
            sizes="100vw"
            className="object-cover opacity-60"
            priority={index === 0}
          />
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 px-6 sm:px-16">
            <h1 className="max-w-lg text-3xl font-bold sm:text-5xl">
              {banner.title ?? "Genuine Parts for Every Ride"}
            </h1>
            {banner.subtitle ? <p className="max-w-md text-slate-200">{banner.subtitle}</p> : null}
            <Link href={banner.linkUrl ?? "/products"} className={buttonClasses("primary", "lg")}>
              Shop Now
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
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current}
                className={`h-2 rounded-full transition-all ${
                  index === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
