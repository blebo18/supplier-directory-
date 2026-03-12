"use client";

import { useState } from "react";
import { SupplierImage } from "@/lib/types";
import Lightbox from "./Lightbox";

interface ImageGalleryProps {
  images: SupplierImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Photos</p>
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setLightboxIndex(i)}
              className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition"
            >
              <img
                src={img.url}
                alt={img.altText || "Supplier photo"}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images.map((img) => ({ url: img.url, altText: img.altText }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
