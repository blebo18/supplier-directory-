"use client";

import { Supplier } from "@/lib/types";
import { useState } from "react";

interface FeaturedSupplierCardProps {
  supplier: Supplier;
  onClick: () => void;
}

export default function FeaturedSupplierCard({ supplier, onClick }: FeaturedSupplierCardProps) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = `https://d2p-eticket-logos.sfo3.cdn.digitaloceanspaces.com/${supplier.id}.jpg`;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition text-left group flex flex-col"
    >
      <div className="flex items-start gap-4 mb-3">
        <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
          {!imgError ? (
            <img
              src={logoUrl}
              alt={`${supplier.company} logo`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-2xl font-bold text-gray-300">
              {supplier.company.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
              {supplier.company}
            </h3>
            <span className="shrink-0 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium uppercase tracking-wide">
              Featured
            </span>
          </div>
          {(supplier.city || supplier.state) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {[supplier.city, supplier.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>
      {supplier.description && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">
          {supplier.description}
        </p>
      )}
      {supplier.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {supplier.categories.slice(0, 4).map((cat) => (
            <span
              key={cat}
              className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
            >
              {cat}
            </span>
          ))}
          {supplier.categories.length > 4 && (
            <span className="inline-block px-2 py-0.5 text-gray-400 text-xs">
              +{supplier.categories.length - 4} more
            </span>
          )}
        </div>
      )}
    </button>
  );
}
