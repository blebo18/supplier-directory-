"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

export default function SettingsPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [heroImage, setHeroImage] = useState<string>("/sd-hero.jpg");
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.heroImage) setHeroImage(data.heroImage);
        if (data.siteLogo) setSiteLogo(data.siteLogo);
      })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (key: string, file: File) => {
    setUploading(key);
    setMessage("");

    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (key === "heroImage") {
          setHeroImage(data.value);
          setMessage("Hero image updated.");
        } else if (key === "siteLogo") {
          setSiteLogo(data.value);
          setMessage("Logo updated.");
        }
      } else {
        setMessage("Failed to upload.");
      }
    } catch {
      setMessage("Upload error.");
    } finally {
      setUploading(null);
    }
  };

  const handleReset = async (key: string, defaultValue: string | null) => {
    setUploading(key);
    setMessage("");

    const formData = new FormData();
    formData.append("key", key);
    formData.append("value", defaultValue || "");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        if (key === "heroImage") {
          setHeroImage("/sd-hero.jpg");
          setMessage("Hero image reset to default.");
        } else if (key === "siteLogo") {
          setSiteLogo(null);
          setMessage("Logo removed.");
        }
      }
    } finally {
      setUploading(null);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-blue-600 hover:underline">Users</Link>
            <Link href="/admin/ads" className="text-blue-600 hover:underline">Ads</Link>
            <Link href="/admin/featured" className="text-blue-600 hover:underline">Featured</Link>
            <Link href="/admin/archived" className="text-blue-600 hover:underline">Archived</Link>
            <Link href="/admin/analytics" className="text-blue-600 hover:underline">Analytics</Link>
            <Link href="/admin/csv-upload" className="text-blue-600 hover:underline">CSV Upload</Link>
            <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Site Logo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Logo</h2>

          <div className="mb-4 flex items-center gap-4">
            <div className="h-16 px-4 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              {siteLogo ? (
                <img src={siteLogo} alt="Site logo" className="h-10 w-auto" />
              ) : (
                <span className="text-sm text-gray-400">No logo set</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Displayed in the navigation bar on the home and search pages.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
              {uploading === "siteLogo" ? "Uploading..." : "Upload Logo"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload("siteLogo", file);
                }}
                disabled={uploading !== null}
                className="hidden"
              />
            </label>
            {siteLogo && (
              <button
                onClick={() => handleReset("siteLogo", "")}
                disabled={uploading !== null}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Image</h2>

          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
            <div
              className="h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-medium">Preview</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-3">
            Current: <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{heroImage}</code>
          </p>

          <div className="flex items-center gap-3">
            <label className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
              {uploading === "heroImage" ? "Uploading..." : "Upload New Image"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload("heroImage", file);
                }}
                disabled={uploading !== null}
                className="hidden"
              />
            </label>
            <button
              onClick={() => handleReset("heroImage", "/sd-hero.jpg")}
              disabled={uploading !== null || heroImage === "/sd-hero.jpg"}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Reset to Default
            </button>
          </div>
        </div>

        {message && (
          <p className="text-sm text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}
