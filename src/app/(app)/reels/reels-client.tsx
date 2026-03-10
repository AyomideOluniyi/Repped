"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, Volume2, VolumeX, Play, Share2, MessageCircle, Dumbbell, Upload } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  muscleGroups: string[];
  views: number;
  likes: number;
  isLiked: boolean;
  user: { id: string; name: string | null; avatar: string | null; username: string | null };
}

function ReelItem({
  reel,
  isActive,
  globalMuted,
  onToggleMute,
}: {
  reel: Reel;
  isActive: boolean;
  globalMuted: boolean;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [likes, setLikes] = useState(reel.likes);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = globalMuted;
  }, [globalMuted]);

  const handleLike = async () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikes((l) => l + (next ? 1 : -1));
    try {
      await fetch(`/api/videos/${reel.id}/like`, {
        method: next ? "POST" : "DELETE",
      });
    } catch {
      // Revert on error
      setIsLiked(!next);
      setLikes((l) => l + (next ? -1 : 1));
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) {
        handleLike();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
      }
    }
    lastTap.current = now;
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: reel.title, url: `${window.location.origin}/videos/${reel.id}` }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/videos/${reel.id}`).catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-dvh snap-start snap-always bg-black flex-shrink-0 overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.url}
        poster={reel.thumbnailUrl ?? undefined}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={globalMuted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={handleDoubleTap}
      />

      {/* Double-tap heart animation */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart className="h-24 w-24 text-white fill-white opacity-90 animate-ping" />
        </div>
      )}

      {/* Paused indicator */}
      {!playing && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-16 w-16 rounded-full bg-black/40 flex items-center justify-center">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Right actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-1">
          <Link href={`/profile/${reel.user.id}`}>
            <div className="rounded-full ring-2 ring-white">
              <Avatar src={reel.user.avatar ?? undefined} name={reel.user.name ?? "?"} size="md" />
            </div>
          </Link>
        </div>

        {/* Like */}
        <button className="flex flex-col items-center gap-1" onClick={handleLike}>
          <div className={cn(
            "h-11 w-11 rounded-full flex items-center justify-center transition-all",
            isLiked ? "bg-accent-green/20" : "bg-black/30"
          )}>
            <Heart className={cn("h-6 w-6 transition-all", isLiked ? "fill-accent-green text-accent-green scale-110" : "text-white")} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">{formatCount(likes)}</span>
        </button>

        {/* View full video */}
        <Link href={`/videos/${reel.id}`} className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 rounded-full bg-black/30 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">{formatCount(reel.views)}</span>
        </Link>

        {/* Share */}
        <button className="flex flex-col items-center gap-1" onClick={handleShare}>
          <div className="h-11 w-11 rounded-full bg-black/30 flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">Share</span>
        </button>

        {/* Mute */}
        <button className="h-11 w-11 rounded-full bg-black/30 flex items-center justify-center" onClick={onToggleMute}>
          {globalMuted
            ? <VolumeX className="h-5 w-5 text-white" />
            : <Volume2 className="h-5 w-5 text-white" />
          }
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-16 px-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-sm">{reel.user.name ?? reel.user.username ?? "User"}</span>
          {reel.user.username && (
            <span className="text-white/60 text-xs">@{reel.user.username}</span>
          )}
        </div>
        <p className="text-white text-sm leading-tight line-clamp-2 mb-2">{reel.title}</p>
        {reel.muscleGroups.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {reel.muscleGroups.slice(0, 3).map((m) => (
              <span key={m} className="flex items-center gap-1 text-2xs font-semibold text-white/80 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Dumbbell className="h-2.5 w-2.5" />
                {m.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function ReelsClient({ initialReels, initialCursor }: { initialReels: Reel[]; initialCursor: string | null }) {
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reels?cursor=${cursor}`);
      const data = await res.json();
      setReels((prev) => [...prev, ...data.videos]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  // IntersectionObserver to track which reel is active
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.index ?? "0");
            setActiveIndex(idx);
            // Load more when near the end
            if (idx >= reels.length - 3) loadMore();
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [reels.length, loadMore]);

  if (reels.length === 0) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-black text-white p-6 text-center">
        <Play className="h-16 w-16 text-white/30" />
        <h2 className="text-xl font-bold">No reels yet</h2>
        <p className="text-white/60 text-sm">Be the first to upload a public workout video!</p>
        <Link href="/videos/upload" className="px-6 py-3 bg-accent-green text-black font-bold rounded-2xl text-sm">
          Upload Video
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Upload button */}
      <Link
        href="/videos/upload"
        className="fixed top-[calc(3.5rem+env(safe-area-inset-top,0px)+0.75rem)] right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload
      </Link>
    <div
      ref={containerRef}
      className="h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {reels.map((reel, i) => (
        <div key={reel.id} data-index={i}>
          <ReelItem
            reel={reel}
            isActive={i === activeIndex}
            globalMuted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        </div>
      ))}
      {loading && (
        <div className="h-dvh snap-start flex items-center justify-center bg-black">
          <div className="h-8 w-8 rounded-full border-2 border-accent-green border-t-transparent animate-spin" />
        </div>
      )}
    </div>
    </div>
  );
}
