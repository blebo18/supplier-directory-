"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface ViewEntry {
  supplierId: number;
  company: string;
  views: number;
}

interface ClickEntry {
  supplierId: number;
  company: string;
  url: string;
  clicks: number;
}

interface AnalyticsData {
  topViewed: ViewEntry[];
  topClicked: ClickEntry[];
  totalViews30d: number;
  totalClicks30d: number;
}

export default function AnalyticsPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isAdmin) return;

    fetch("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [token, isAdmin]);

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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-blue-600 hover:underline">Users</Link>
            <Link href="/admin/archived" className="text-blue-600 hover:underline">Archived</Link>
            <Link href="/admin/csv-upload" className="text-blue-600 hover:underline">CSV Upload</Link>
            <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Total Views (30 days)</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalViews30d.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm text-gray-500">Total Link Clicks (30 days)</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalClicks30d.toLocaleString()}</p>
              </div>
            </div>

            {/* Top Viewed */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Viewed Suppliers</h2>
              {data.topViewed.length === 0 ? (
                <p className="text-gray-500 text-sm">No view data yet.</p>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topViewed.map((v) => (
                        <tr key={v.supplierId} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 text-sm text-gray-900">{v.company}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{v.views.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Clicked */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Clicked Website Links</h2>
              {data.topClicked.length === 0 ? (
                <p className="text-gray-500 text-sm">No click data yet.</p>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">URL</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topClicked.map((c, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 text-sm text-gray-900">{c.company}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 break-all max-w-xs truncate">{c.url}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{c.clicks.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
