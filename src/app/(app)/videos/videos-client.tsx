"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Upload, Search, Filter, Lock, Globe, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideosClient({ videos, currentUserId }: { videos: Video[]; currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = videos.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = activeFilter === "All" || v.muscleGroups.includes(activeFilter);
    return matchesSearch && matchesMuscle;
  });

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
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/videos/${video.id}`}>
                <div className="rounded-2xl overflow-hidden border border-border bg-surface-elevated hover:border-border-strong transition-colors group">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-surface">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-surface-elevated">
                        <Play className="h-8 w-8 text-text-muted" />
                      </div>
                    )}
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
                    <div className="absolute top-2 right-2">
                      {video.isPublic
                        ? <Globe className="h-3.5 w-3.5 text-white/70" />
                        : <Lock className="h-3.5 w-3.5 text-white/70" />
                      }
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
        </div>
      )}
    </div>
  );
}
