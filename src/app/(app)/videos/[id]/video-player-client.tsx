"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Heart, Send, Trash2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface CommentUser {
  id: string;
  name: string | null;
  avatar: string | null;
  username: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: CommentUser;
  replies: { id: string; content: string; createdAt: Date; user: CommentUser }[];
}

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
  currentUserId: string;
}

// ── Comment item ──────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  videoId,
  currentUserId,
  onDelete,
  onReplyPosted,
}: {
  comment: Comment;
  videoId: string;
  currentUserId: string;
  onDelete: (id: string) => void;
  onReplyPosted: (parentId: string, reply: Comment["replies"][0]) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const postReply = async () => {
    const content = replyText.trim();
    if (!content || replying) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId: comment.id }),
      });
      if (res.ok) {
        const reply = await res.json();
        onReplyPosted(comment.id, reply);
        setReplyText("");
        setShowReplyInput(false);
        setShowReplies(true);
      }
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2.5">
        <Avatar src={comment.user.avatar ?? undefined} name={comment.user.name ?? "?"} size="xs" />
        <div className="flex-1 min-w-0">
          <div className="bg-surface-elevated rounded-2xl rounded-tl-sm px-3 py-2">
            <p className="text-xs font-semibold text-text-primary mb-0.5">
              {comment.user.name ?? comment.user.username ?? "User"}
            </p>
            <p className="text-sm text-text-primary leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <span className="text-xs text-text-muted">
              {formatRelativeTime(new Date(comment.createdAt))}
            </span>
            <button
              onClick={() => setShowReplyInput((v) => !v)}
              className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
              Reply
            </button>
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-0.5 text-xs font-semibold text-accent-green hover:opacity-80 transition-opacity"
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
            {comment.user.id === currentUserId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-auto text-text-muted hover:text-rose-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 flex gap-2 items-center overflow-hidden"
              >
                <input
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") postReply(); }}
                  placeholder={`Reply to ${comment.user.name ?? "user"}...`}
                  className="flex-1 bg-surface-elevated rounded-xl border border-border px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50"
                />
                <button
                  onClick={postReply}
                  disabled={!replyText.trim() || replying}
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all shrink-0",
                    replyText.trim() ? "bg-accent-green text-background" : "bg-border text-text-muted"
                  )}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          <AnimatePresence>
            {showReplies && comment.replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 ml-1 space-y-2 pl-3 border-l-2 border-border overflow-hidden"
              >
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2">
                    <Avatar src={reply.user.avatar ?? undefined} name={reply.user.name ?? "?"} size="xs" />
                    <div className="flex-1 min-w-0">
                      <div className="bg-surface-elevated rounded-2xl rounded-tl-sm px-3 py-2">
                        <p className="text-xs font-semibold text-text-primary mb-0.5">
                          {reply.user.name ?? reply.user.username ?? "User"}
                        </p>
                        <p className="text-sm text-text-primary leading-relaxed">{reply.content}</p>
                      </div>
                      <p className="text-xs text-text-muted mt-1 ml-1">
                        {formatRelativeTime(new Date(reply.createdAt))}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function VideoPlayerClient({ video, currentUserId }: VideoPlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/videos/${video.id}/comments`);
    if (res.ok) {
      setComments(await res.json());
      setCommentsLoaded(true);
    }
  }, [video.id]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const postComment = async () => {
    const content = commentText.trim();
    if (!content || posting) return;
    setPosting(true);
    setCommentText("");
    try {
      const res = await fetch(`/api/videos/${video.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
      }
    } finally {
      setPosting(false);
      inputRef.current?.focus();
    }
  };

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/videos/${video.id}/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleReplyPosted = (parentId: string, reply: Comment["replies"][0]) => {
    setComments((prev) =>
      prev.map((c) => c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c)
    );
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
      <div className="p-4 space-y-3 border-b border-border">
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

      {/* Comments */}
      <div className="p-4 space-y-4 pb-8">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-text-muted" />
          <h2 className="font-bold text-text-primary">
            Comments{commentsLoaded && <span className="text-text-muted font-normal text-sm ml-1">({comments.length})</span>}
          </h2>
        </div>

        {/* Comment input */}
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") postComment(); }}
            placeholder="Add a comment..."
            className="flex-1 bg-surface-elevated rounded-2xl border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 transition-colors"
          />
          <button
            onClick={postComment}
            disabled={!commentText.trim() || posting}
            className={cn(
              "h-10 w-10 rounded-2xl flex items-center justify-center transition-all shrink-0",
              commentText.trim() ? "bg-accent-green text-background" : "bg-surface-elevated text-text-muted"
            )}
          >
            {posting
              ? <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </div>

        {/* Comment list */}
        {!commentsLoaded ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2.5 animate-pulse">
                <div className="h-7 w-7 rounded-full bg-surface-elevated shrink-0" />
                <div className="h-14 flex-1 bg-surface-elevated rounded-2xl" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <Heart className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                videoId={video.id}
                currentUserId={currentUserId}
                onDelete={deleteComment}
                onReplyPosted={handleReplyPosted}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
