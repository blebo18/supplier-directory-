"use client";

import { useState, useRef } from "react";
import { SupplierImage } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";

interface ImageUploaderProps {
  supplierId: number;
  images: SupplierImage[];
  onImagesChange: (images: SupplierImage[]) => void;
}

export default function ImageUploader({ supplierId, images, onImagesChange }: ImageUploaderProps) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    setError("");
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      setError("Maximum 5 images allowed");
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const newImages: SupplierImage[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/suppliers/${supplierId}/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Upload failed");
          break;
        }

        newImages.push(await res.json());
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (imageId: number) => {
    const res = await fetch(`/api/suppliers/${supplierId}/images/${imageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      onImagesChange(images.filter((img) => img.id !== imageId));
    }
  };

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        Photos ({images.length}/5)
      </p>

      {error && (
        <div className="mb-2 px-3 py-1.5 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}

      <div className="flex gap-2 flex-wrap">
        {images.map((img) => (
          <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
            <img src={img.url} alt={img.altText || ""} className="w-full h-full object-cover" />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {images.length < 5 && (
          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              disabled={uploading}
            />
            {uploading ? (
              <span className="text-xs text-gray-400">Uploading...</span>
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </label>
        )}
      </div>
    </div>
  );
}
