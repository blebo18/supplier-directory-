"use client";

import { Supplier } from "@/lib/types";

interface SupplierCardProps {
  supplier: Supplier;
  onClick: () => void;
}

export default function SupplierCard({ supplier, onClick }: SupplierCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition text-left group"
    >
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1 truncate">
        {supplier.company}
      </h3>
      {(supplier.city || supplier.state) && (
        <p className="text-sm text-gray-500 mb-2">
          {[supplier.city, supplier.state].filter(Boolean).join(", ")}
        </p>
      )}
      {supplier.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {supplier.description}
        </p>
      )}
      {supplier.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {supplier.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {cat}
            </span>
          ))}
          {supplier.categories.length > 3 && (
            <span className="inline-block px-2 py-0.5 text-gray-400 text-xs">
              +{supplier.categories.length - 3} more
            </span>
          )}
        </div>
      )}
    </button>
  );
}
