"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface FeaturedSupplier {
  id: number;
  company: string;
  city: string | null;
  state: string | null;
  categories: string[];
}

export default function FeaturedPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [suppliers, setSuppliers] = useState<FeaturedSupplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FeaturedSupplier[]>([]);
  const [searching, setSearching] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchFeatured = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);

    const res = await fetch(`/api/suppliers?featured=true&pageSize=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSuppliers(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [token, isAdmin]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  useEffect(() => {
    if (!search.trim() || !token) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/suppliers?q=${encodeURIComponent(search)}&pageSize=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSearchResults(data.items || []);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, token]);

  const toggleFeatured = async (id: number, featured: boolean) => {
    setToggling(id);
    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ featured }),
    });

    if (res.ok) {
      if (featured) {
        fetchFeatured();
      } else {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
        setTotal((prev) => prev - 1);
      }
    }
    setToggling(null);
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

  const featuredIds = new Set(suppliers.map((s) => s.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Featured Suppliers</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-blue-600 hover:underline">Users</Link>
            <Link href="/admin/ads" className="text-blue-600 hover:underline">Ads</Link>
            <Link href="/admin/archived" className="text-blue-600 hover:underline">Archived</Link>
            <Link href="/admin/analytics" className="text-blue-600 hover:underline">Analytics</Link>
            <Link href="/admin/csv-upload" className="text-blue-600 hover:underline">CSV Upload</Link>
            <Link href="/admin/settings" className="text-blue-600 hover:underline">Settings</Link>
            <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Search to add */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search suppliers to feature</label>
          <input
            type="text"
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400"
          />
          {searching && <p className="text-xs text-gray-400 mt-1">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
              {searchResults.filter((s) => !featuredIds.has(s.id)).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{s.company}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {[s.city, s.state].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFeatured(s.id, true)}
                    disabled={toggling === s.id}
                    className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
                  >
                    {toggling === s.id ? "..." : "Feature"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current featured count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">{total} featured</span>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No featured suppliers. Use the search above to feature suppliers.
          </div>
        ) : (
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
                        onClick={() => toggleFeatured(s.id, false)}
                        disabled={toggling === s.id}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {toggling === s.id ? "..." : "Unfeature"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
