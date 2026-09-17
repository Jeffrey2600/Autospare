"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ImageGallery({
  images,
  title,
}: {
  images: { url: string; altText: string | null }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        {current ? (
          <Image
            src={current.url}
            alt={current.altText ?? title}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-contain p-6"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">No image</div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white",
                idx === active ? "border-brand-600" : "border-slate-200"
              )}
            >
              <Image src={img.url} alt={img.altText ?? title} fill className="object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
