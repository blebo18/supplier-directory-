"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdWithStats } from "@/lib/types";
import Link from "next/link";

export default function AdminAdsPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [ads, setAds] = useState<AdWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [placement, setPlacement] = useState("GRID");
  const [weight, setWeight] = useState("1");
  const [active, setActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const resetForm = () => {
    setName("");
    setDestinationUrl("");
    setPlacement("GRID");
    setWeight("1");
    setActive(true);
    setStartDate("");
    setEndDate("");
    setImageFile(null);
    setEditingId(null);
    setFormError("");
  };

  useEffect(() => {
    if (!token || !isAdmin) return;

    fetch("/api/admin/ads", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAds(data.ads || []);
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

  const handleEdit = (ad: AdWithStats) => {
    setEditingId(ad.id);
    setName(ad.name);
    setDestinationUrl(ad.destinationUrl);
    setPlacement(ad.placement);
    setWeight(String(ad.weight));
    setActive(ad.active);
    setStartDate(ad.startDate.slice(0, 10));
    setEndDate(ad.endDate.slice(0, 10));
    setImageFile(null);
    setShowForm(true);
    setFormError("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ad and all its tracking data?")) return;

    const res = await fetch(`/api/admin/ads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setAds(ads.filter((a) => a.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("destinationUrl", destinationUrl);
      formData.set("placement", placement);
      formData.set("weight", weight);
      formData.set("active", String(active));
      formData.set("startDate", startDate);
      formData.set("endDate", endDate);
      if (imageFile) formData.set("image", imageFile);

      const isEdit = editingId !== null;
      const url = isEdit ? `/api/admin/ads/${editingId}` : "/api/admin/ads";
      const method = isEdit ? "PUT" : "POST";

      if (!isEdit && !imageFile) {
        setFormError("Image is required for new ads");
        return;
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to save ad");
        return;
      }

      const saved = await res.json();
      if (isEdit) {
        setAds(ads.map((a) => (a.id === saved.id ? saved : a)));
      } else {
        setAds([saved, ...ads]);
      }
      setShowForm(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Ad Management</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-blue-600 hover:underline">Users</Link>
            <Link href="/admin/featured" className="text-blue-600 hover:underline">Featured</Link>
            <Link href="/admin/archived" className="text-blue-600 hover:underline">Archived</Link>
            <Link href="/admin/analytics" className="text-blue-600 hover:underline">Analytics</Link>
            <Link href="/admin/csv-upload" className="text-blue-600 hover:underline">CSV Upload</Link>
            <Link href="/admin/settings" className="text-blue-600 hover:underline">Settings</Link>
            <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">{ads.length} ad{ads.length !== 1 ? "s" : ""}</span>
          <button
            onClick={() => {
              if (showForm && editingId === null) {
                setShowForm(false);
                resetForm();
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm && editingId === null ? "Cancel" : "Create Ad"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
            {formError && (
              <div className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">{formError}</div>
            )}
            {editingId !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Editing ad #{editingId}</span>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                  placeholder="Ad name (internal)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Destination URL</label>
                <input
                  type="url"
                  required
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Placement</label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                >
                  <option value="GRID">Grid</option>
                  <option value="SIDEBAR">Sidebar</option>
                  <option value="LEADERBOARD">Leaderboard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Weight (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-900 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : editingId !== null ? "Update Ad" : "Create Ad"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Placement</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Impr.</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">CTR</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-sm text-gray-900">{ad.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ad.placement}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ad.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {ad.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{ad.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{ad.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{ad.ctr.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="text-sm text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {ads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                      No ads yet. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
