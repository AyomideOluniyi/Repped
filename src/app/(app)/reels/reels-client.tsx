"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, Volume2, VolumeX, Play, Share2, Dumbbell, Camera, X, Send, Search, Check, MessageCircle } from "lucide-react";
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

// ── Share modal ────────────────────────────────────────────────────────────────
function ShareModal({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<{ id: string; name: string | null; username: string | null; avatar: string | null }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/buddies")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = users.filter((u) =>
    (u.name ?? u.username ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSend = async () => {
    if (selected.size === 0) return;
    setSending(true);
    const videoUrl = `${window.location.origin}/videos/${reel.id}`;
    const content = `Check out this video: ${reel.title}\n${videoUrl}`;
    try {
      await Promise.all(
        Array.from(selected).map(async (participantId) => {
          const convRes = await fetch("/api/messages/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participantId }),
          });
          const conv = await convRes.json();
          await fetch(`/api/messages/${conv.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });
        })
      );
      setSent(true);
      setTimeout(onClose, 1200);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full bg-surface rounded-t-3xl max-h-[70dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 rounded-full bg-border-strong mx-auto mt-3" />
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <p className="font-bold text-text-primary">Send to friends</p>
          <button onClick={onClose} className="text-text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video preview strip */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated">
            <div className="h-10 w-10 rounded-lg bg-border shrink-0 overflow-hidden">
              {reel.thumbnailUrl ? (
                <img src={reel.thumbnailUrl} className="h-full w-full object-cover" alt="" />
              ) : (
                <div className="h-full w-full bg-accent-green/10 flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-accent-green" />
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-text-primary line-clamp-1 flex-1">{reel.title}</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated">
            <Search className="h-4 w-4 text-text-muted shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search friends..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {users.length === 0 ? (
            <p className="text-center py-6 text-sm text-text-muted">No friends yet — follow people to share with them</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-4 text-sm text-text-muted">No results</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggle(u.id)}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-elevated transition-colors text-left"
                >
                  <Avatar src={u.avatar ?? undefined} name={u.name ?? u.username ?? "?"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{u.name ?? u.username}</p>
                    {u.username && <p className="text-xs text-text-muted">@{u.username}</p>}
                  </div>
                  <div className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                    selected.has(u.id) ? "bg-accent-green border-accent-green" : "border-border"
                  )}>
                    {selected.has(u.id) && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Send button */}
        <div className="px-4 py-3 border-t border-border" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending || sent}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all",
              sent
                ? "bg-accent-green text-white"
                : selected.size > 0
                  ? "bg-accent-green text-black"
                  : "bg-surface-elevated text-text-muted cursor-not-allowed"
            )}
          >
            {sent ? (
              <><Check className="h-4 w-4" /> Sent!</>
            ) : sending ? (
              <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <><Send className="h-4 w-4" /> {selected.size > 0 ? `Send to ${selected.size}` : "Select friends"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single reel ────────────────────────────────────────────────────────────────
function ReelItem({
  reel,
  isActive,
  globalMuted,
  onToggleMute,
  currentUserId,
  initialFollowing,
}: {
  reel: Reel;
  isActive: boolean;
  globalMuted: boolean;
  onToggleMute: () => void;
  currentUserId: string;
  initialFollowing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [likes, setLikes] = useState(reel.likes);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [showHeart, setShowHeart] = useState(false);
  const [following, setFollowing] = useState(initialFollowing);
  const [showShare, setShowShare] = useState(false);
  const lastTap = useRef(0);
  const isOwnReel = reel.user.id === currentUserId;

  // Auto-play / pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) video.play().catch(() => {});
    else { video.pause(); video.currentTime = 0; }
  }, [isActive]);

  // Mute — React's `muted` prop is unreliable; set it imperatively via ref
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = globalMuted;
  }, [globalMuted]);

  const handleLike = async () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikes((l) => l + (next ? 1 : -1));
    try {
      await fetch(`/api/videos/${reel.id}/like`, { method: next ? "POST" : "DELETE" });
    } catch {
      setIsLiked(!next);
      setLikes((l) => l + (next ? -1 : 1));
    }
  };

  const handleFollow = async () => {
    const next = !following;
    setFollowing(next);
    try {
      await fetch(`/api/users/${reel.user.id}/follow`, { method: next ? "POST" : "DELETE" });
    } catch {
      setFollowing(!next);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) { handleLike(); setShowHeart(true); setTimeout(() => setShowHeart(false), 800); }
    }
    lastTap.current = now;
  };

  return (
    <div className="relative w-full h-full snap-start snap-always bg-black flex-shrink-0 overflow-hidden">
      {/* Video — no muted prop; controlled via useEffect ref */}
      <video
        ref={videoRef}
        src={reel.url}
        poster={reel.thumbnailUrl ?? undefined}
        className="w-full h-full object-cover md:object-contain"
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={handleDoubleTap}
      />

      {/* Double-tap heart burst */}
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

      {/* Right action sidebar — positioned above bottom nav using CSS var */}
      <div className="absolute right-3 flex flex-col items-center gap-5" style={{ bottom: "calc(var(--nav-bar-height) + 1.5rem)" }}>

        {/* Avatar + follow "+" */}
        <div className="relative">
          <Link href={`/profile/${reel.user.id}`}>
            <div className="rounded-full ring-2 ring-white">
              <Avatar src={reel.user.avatar ?? undefined} name={reel.user.name ?? "?"} size="md" />
            </div>
          </Link>
          {!isOwnReel && (
            <button
              onClick={handleFollow}
              className={cn(
                "absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full flex items-center justify-center border-2 border-black transition-all",
                following ? "bg-white" : "bg-accent-green"
              )}
            >
              {following
                ? <Check className="h-2.5 w-2.5 text-black" />
                : <span className="text-black text-[10px] font-black leading-none">+</span>
              }
            </button>
          )}
        </div>

        {/* Like — only show count when > 0 (real interactions only) */}
        <button className="flex flex-col items-center gap-1" onClick={handleLike}>
          <div className={cn(
            "h-11 w-11 rounded-full flex items-center justify-center transition-all",
            isLiked ? "bg-accent-green/20" : "bg-black/30"
          )}>
            <Heart className={cn("h-6 w-6 transition-all", isLiked ? "fill-accent-green text-accent-green scale-110" : "text-white")} />
          </div>
          {likes > 0 && <span className="text-white text-xs font-semibold drop-shadow-lg">{formatCount(likes)}</span>}
        </button>

        {/* Comment — links to video detail */}
        <Link href={`/videos/${reel.id}`} className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 rounded-full bg-black/30 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">Comment</span>
        </Link>

        {/* Share — opens in-app friend picker */}
        <button className="flex flex-col items-center gap-1" onClick={() => setShowShare(true)}>
          <div className="h-11 w-11 rounded-full bg-black/30 flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">Share</span>
        </button>

        {/* Mute toggle */}
        <button
          className="h-11 w-11 rounded-full bg-black/30 flex items-center justify-center"
          onClick={onToggleMute}
        >
          {globalMuted
            ? <VolumeX className="h-5 w-5 text-white" />
            : <Volume2 className="h-5 w-5 text-white" />
          }
        </button>

        {/* Post / upload */}
        <Link href="/videos/upload" className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 rounded-full bg-black/30 border border-white/20 flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">Post</span>
        </Link>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 pt-16 px-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" style={{ paddingBottom: "calc(var(--nav-bar-height) + 1.5rem)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-bold text-sm">{reel.user.name ?? reel.user.username ?? "User"}</span>
          {reel.user.username && <span className="text-white/60 text-xs">@{reel.user.username}</span>}
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

      {showShare && <ShareModal reel={reel} onClose={() => setShowShare(false)} />}
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── Feed ───────────────────────────────────────────────────────────────────────
export function ReelsClient({
  initialReels,
  initialCursor,
  currentUserId,
  followingIds,
}: {
  initialReels: Reel[];
  initialCursor: string | null;
  currentUserId: string;
  followingIds: string[];
}) {
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const followingSet = new Set(followingIds);

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.index ?? "0");
            setActiveIndex(idx);
            if (idx >= reels.length - 3) loadMore();
          }
        });
      },
      { root: container, threshold: 0.6 }
    );
    container.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
    <div
      ref={containerRef}
      className="h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {reels.map((reel, i) => (
        <div key={reel.id} data-index={i} className="h-dvh">
          <ReelItem
            reel={reel}
            isActive={i === activeIndex}
            globalMuted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            currentUserId={currentUserId}
            initialFollowing={followingSet.has(reel.user.id)}
          />
        </div>
      ))}
      {loading && (
        <div className="h-dvh snap-start flex items-center justify-center bg-black">
          <div className="h-8 w-8 rounded-full border-2 border-accent-green border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
