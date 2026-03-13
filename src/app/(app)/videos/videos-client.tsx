"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Upload, Search, Lock, Globe, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const MUSCLE_GROUPS = [
  "All", "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS",
  "QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "ABS", "FULL_BODY", "CARDIO"
];

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  muscleGroups: string[];
  isPublic: boolean;
  views: number;
  createdAt: Date;
  user: { id: string; name: string | null; avatar: string | null };
}

// Uses autoPlay+muted to force mobile browsers (incl. iOS Safari) to buffer data,
// then pauses at 1s for a stable thumbnail frame.
function VideoThumbnail({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onCanPlay = () => { video.currentTime = 1; };
    const onSeeked = () => { video.pause(); setReady(true); };
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("seeked", onSeeked);
    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("seeked", onSeeked);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <video
        ref={videoRef}
        src={src}
        preload="auto"
        autoPlay
        muted
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-surface-elevated">
          <div className="h-5 w-5 rounded-full border-2 border-text-muted border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideosClient({ videos: initialVideos, currentUserId }: { videos: Video[]; currentUserId: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [videos, setVideos] = useState(initialVideos);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = videos.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = activeFilter === "All" || v.muscleGroups.includes(activeFilter);
    return matchesSearch && matchesMuscle;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast({ title: "Failed to delete video", variant: "error" });
      setVideos(initialVideos);
    }
    setDeleting(null);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Search + Upload */}
      <div className="flex gap-2">
        <Input
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="flex-1"
        />
        <Link href="/videos/upload">
          <Button size="icon" leftIcon={<Upload className="h-4 w-4" />} />
        </Link>
      </div>

      {/* Muscle group filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setActiveFilter(group)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === group
                ? "bg-accent-green text-background"
                : "bg-surface-elevated text-text-secondary border border-border hover:border-border-strong"
            }`}
          >
            {group === "All" ? "All" : group.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Video grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Play className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No videos yet</h2>
          <p className="text-text-secondary mb-6 text-sm">Upload workout videos to build your library</p>
          <Link href="/videos/upload">
            <Button leftIcon={<Upload className="h-4 w-4" />}>Upload Video</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/videos/${video.id}`}>
                  <div className="rounded-2xl overflow-hidden border border-border bg-surface-elevated hover:border-border-strong transition-colors group">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-surface">
                      {video.thumbnailUrl
                        ? <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        : <VideoThumbnail src={video.url} />
                      }
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      {/* Top row: visibility + delete (own videos only) */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                        {video.isPublic
                          ? <Globe className="h-3.5 w-3.5 text-white/70" />
                          : <Lock className="h-3.5 w-3.5 text-white/70" />
                        }
                        {video.user.id === currentUserId && (
                          <button
                            onClick={(e) => handleDelete(e, video.id)}
                            disabled={deleting === video.id}
                            className="h-6 w-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-2.5">
                      <p className="font-semibold text-text-primary text-sm line-clamp-2 leading-tight">{video.title}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {video.muscleGroups.slice(0, 1).map((m) => (
                          <Badge key={m} variant="secondary" className="text-2xs">
                            {m.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {video.views > 0 && (
                          <span className="text-2xs text-text-muted flex items-center gap-0.5 ml-auto">
                            <Eye className="h-2.5 w-2.5" /> {video.views}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
