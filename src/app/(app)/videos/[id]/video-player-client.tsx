"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface VideoPlayerClientProps {
  video: {
    id: string;
    title: string;
    description: string | null;
    url: string;
    muscleGroups: string[];
    difficulty: string | null;
    views: number;
    createdAt: Date;
    user: { id: string; name: string | null; avatar: string | null };
  };
}

export function VideoPlayerClient({ video }: VideoPlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const setPlaybackSpeed = (s: number) => {
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSpeed(s);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      {/* Video player */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-contain"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          muted={muted}
          playsInline
          onClick={togglePlay}
        />
        {/* Controls overlay */}
        <div className="absolute inset-0 flex items-end" onClick={togglePlay}>
          <div className="w-full p-3 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white">
                  {playing ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white ml-0.5" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} className="text-white/70">
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (videoRef.current) videoRef.current.currentTime = 0; }} className="text-white/70">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }} className="text-white/70">
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Speed controls */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border bg-surface">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setPlaybackSpeed(s)}
            className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              speed === s ? "bg-accent-green text-background" : "bg-surface-elevated text-text-muted hover:text-text-secondary"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Video info */}
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-black font-display text-text-primary">{video.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar src={video.user.avatar} name={video.user.name ?? undefined} size="sm" />
          <div>
            <p className="text-sm font-semibold text-text-primary">{video.user.name}</p>
            <p className="text-xs text-text-muted">{formatRelativeTime(video.createdAt)}</p>
          </div>
          <span className="ml-auto text-xs text-text-muted">{video.views} views</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {video.muscleGroups.map((m) => (
            <Badge key={m} variant="default">{m.replace(/_/g, " ")}</Badge>
          ))}
          {video.difficulty && <Badge variant="secondary">{video.difficulty}</Badge>}
        </div>
        {video.description && (
          <p className="text-sm text-text-secondary leading-relaxed">{video.description}</p>
        )}
      </div>
    </motion.div>
  );
}
