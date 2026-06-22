"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function PhotoGrid({
  images,
  onRemove,
}: {
  images: string[];
  onRemove?: (url: string) => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {images.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-lg border border-line"
          >
            <button
              type="button"
              onClick={() => setLightbox(url)}
              className="h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(url)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}
