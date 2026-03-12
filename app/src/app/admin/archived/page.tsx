"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface ArchivedSupplier {
  id: number;
  company: string;
  city: string | null;
  state: string | null;
  categories: string[];
}

export default function ArchivedPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [suppliers, setSuppliers] = useState<ArchivedSupplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unarchiving, setUnarchiving] = useState<number | null>(null);

  const fetchArchived = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);

    const params = new URLSearchParams({
      archivedOnly: "true",
      page: page.toString(),
      pageSize: "50",
    });
    if (search) params.set("q", search);

    const res = await fetch(`/api/suppliers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSuppliers(data.items || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [token, isAdmin, page, search]);

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  const handleUnarchive = async (id: number) => {
    if (!confirm("Unarchive this supplier? It will appear in the public directory again.")) return;

    setUnarchiving(id);
    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ archived: false }),
    });

    if (res.ok) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
    }
    setUnarchiving(null);
  };

  if (authLoading) return null;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Access denied. Admin role required.</p>
          <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Archived Suppliers</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-blue-600 hover:underline">Users</Link>
            <Link href="/admin/ads" className="text-blue-600 hover:underline">Ads</Link>
            <Link href="/admin/featured" className="text-blue-600 hover:underline">Featured</Link>
            <Link href="/admin/analytics" className="text-blue-600 hover:underline">Analytics</Link>
            <Link href="/admin/csv-upload" className="text-blue-600 hover:underline">CSV Upload</Link>
            <Link href="/admin/settings" className="text-blue-600 hover:underline">Settings</Link>
            <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Search and count */}
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search archived suppliers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400"
          />
          <span className="text-sm text-gray-500 shrink-0">
            {total.toLocaleString()} archived
          </span>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {search ? "No archived suppliers match your search." : "No archived suppliers."}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categories</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-sm text-gray-400">{s.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{s.company}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {[s.city, s.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {s.categories.length > 0 ? s.categories.slice(0, 3).join(", ") : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleUnarchive(s.id)}
                          disabled={unarchiving === s.id}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                        >
                          {unarchiving === s.id ? "..." : "Unarchive"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
