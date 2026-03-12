"use client";

import { useState } from "react";
import { SupplierVideo } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";

interface VideoManagerProps {
  supplierId: number;
  videos: SupplierVideo[];
  onVideosChange: (videos: SupplierVideo[]) => void;
}

export default function VideoManager({ supplierId, videos, onVideosChange }: VideoManagerProps) {
  const { token } = useAuth();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAdding(true);

    try {
      const res = await fetch(`/api/suppliers/${supplierId}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, title: title || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add video");
        return;
      }

      const video = await res.json();
      onVideosChange([...videos, video]);
      setUrl("");
      setTitle("");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (videoId: number) => {
    const res = await fetch(`/api/suppliers/${supplierId}/videos/${videoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      onVideosChange(videos.filter((v) => v.id !== videoId));
    }
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Videos</p>

      {error && (
        <div className="mb-2 px-3 py-1.5 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}

      {videos.length > 0 && (
        <div className="space-y-2 mb-3">
          {videos.map((video) => (
            <div key={video.id} className="flex items-center gap-2 text-sm">
              <span className="truncate flex-1 text-gray-700">{video.title || video.url}</span>
              <button
                onClick={() => handleDelete(video.id)}
                className="shrink-0 text-red-500 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="url"
          placeholder="Video URL (YouTube or direct link)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-36 px-3 py-1.5 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition shrink-0"
        >
          Add
        </button>
      </form>
    </div>
  );
}
