"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface UploadResult {
  created: number;
  updated: number;
  archived: number;
  categories: number;
  total: number;
}

export default function CSVUploadPage() {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

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

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File | null;

    if (!file || !file.name.endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    setUploading(true);

    try {
      const res = await fetch("/api/admin/csv-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setResult(data);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CSV Upload</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-blue-600 hover:underline">Users</Link>
            <Link href="/admin/archived" className="text-blue-600 hover:underline">Archived</Link>
            <Link href="/admin/analytics" className="text-blue-600 hover:underline">Analytics</Link>
            <Link href="/" className="text-blue-600 hover:underline">Back to directory</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Import Suppliers from CSV</h2>
          <p className="text-sm text-gray-500 mb-6">
            Upload a CSV file to update the supplier directory. Existing suppliers will be updated,
            new suppliers will be created, and suppliers not in the CSV will be archived.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <input
                type="file"
                name="file"
                accept=".csv"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {uploading ? "Uploading..." : "Upload & Import"}
            </button>
          </form>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 rounded-lg border border-green-200 p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Import Complete</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Total Processed</p>
                  <p className="text-lg font-bold text-green-900">{result.total}</p>
                </div>
                <div>
                  <p className="text-green-600">Created</p>
                  <p className="text-lg font-bold text-green-900">{result.created}</p>
                </div>
                <div>
                  <p className="text-green-600">Updated</p>
                  <p className="text-lg font-bold text-green-900">{result.updated}</p>
                </div>
                <div>
                  <p className="text-green-600">Archived</p>
                  <p className="text-lg font-bold text-green-900">{result.archived}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
