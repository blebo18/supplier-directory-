"use client";

import { SupplierVideo } from "@/lib/types";

interface VideoPlayerProps {
  videos: SupplierVideo[];
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  if (videos.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Videos</p>
      <div className="space-y-3">
        {videos.map((video) => {
          const ytId = getYouTubeId(video.url);
          return (
            <div key={video.id}>
              {video.title && (
                <p className="text-sm font-medium text-gray-700 mb-1">{video.title}</p>
              )}
              {ytId ? (
                <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={video.title || "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  controls
                  className="w-full rounded-lg"
                  src={video.url}
                >
                  <track kind="captions" />
                </video>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
