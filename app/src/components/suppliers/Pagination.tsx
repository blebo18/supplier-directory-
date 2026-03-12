"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Previous
      </button>
      {generatePageNumbers(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`px-3 py-2 text-sm rounded-lg transition ${
              p === page
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Next
      </button>
    </div>
  );
}
