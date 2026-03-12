"use client";

import { Supplier } from "@/lib/types";
import SupplierCard from "./SupplierCard";

interface SupplierGridProps {
  suppliers: Supplier[];
  loading: boolean;
  onSelect: (supplier: Supplier) => void;
}

export default function SupplierGrid({ suppliers, loading, onSelect }: SupplierGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No suppliers found</p>
        <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          onClick={() => onSelect(supplier)}
        />
      ))}
    </div>
  );
}
