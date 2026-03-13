"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Plus, Users, X, Send, Search, Check, ImagePlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useUploadThing } from "@/lib/uploadthing";

interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null; username: string | null };
}

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  createdAt: Date;
  user: { id: string; name: string | null; avatar: string | null; username: string | null };
  likes: { userId: string }[];
  _count: { likes: number; comments: number };
}

// ── Comment sheet ───────────────────────────────────────────────────────────────
function CommentSheet({
  post,
  onClose,
  onCommentAdded,
}: {
  post: Post;
  onClose: () => void;
  onCommentAdded: (postId: string) => void;
}) {
  const { toast } = useToast();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${post.id}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [post.id]);

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (!res.ok) throw new Error();
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      onCommentAdded(post.id);
      setText("");
    } catch {
      toast({ title: "Failed to post comment", variant: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full bg-surface rounded-t-3xl max-h-[75dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 rounded-full bg-border-strong mx-auto mt-3" />
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
          <p className="font-bold text-text-primary">Comments</p>
          <button onClick={onClose} className="text-text-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-text-muted py-8">No comments yet — be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar src={c.user.avatar ?? undefined} name={c.user.name ?? "?"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary">{c.user.name ?? c.user.username}</p>
                  <p className="text-sm text-text-secondary mt-0.5">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div
          className="px-4 py-3 border-t border-border flex items-center gap-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
            placeholder="Add a comment..."
            className="flex-1 bg-surface-elevated rounded-2xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="h-10 w-10 rounded-full bg-accent-green flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <Send className="h-4 w-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Share sheet ─────────────────────────────────────────────────────────────────
function ShareSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  const { toast } = useToast();
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
    const content = `Check out this post: "${post.content.slice(0, 100)}${post.content.length > 100 ? "…" : ""}"`;
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
    } catch {
      toast({ title: "Failed to send", variant: "error" });
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
          <p className="font-bold text-text-primary">Share post</p>
          <button onClick={onClose} className="text-text-muted"><X className="h-5 w-5" /></button>
        </div>
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
        <div className="px-4 py-3 border-t border-border" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending || sent}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all",
              sent ? "bg-accent-green text-white"
                : selected.size > 0 ? "bg-accent-green text-black"
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

export function SocialClient({ posts, currentUserId }: { posts: Post[]; currentUserId: string }) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(posts.filter((p) => p.likes.some((l) => l.userId === currentUserId)).map((p) => p.id))
  );
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    Object.fromEntries(posts.map((p) => [p.id, p._count.comments]))
  );
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("imageUploader");
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (selectedImages.length + files.length > 4) {
      toast({ title: "Max 4 photos per post", variant: "error" });
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      setImagePreviews((prev) => [...prev, url]);
    });
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleLike = async (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  };

  const submitPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      let mediaUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploaded = await startUpload(selectedImages);
        mediaUrls = (uploaded ?? []).map((u) => u.ufsUrl);
      }
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, mediaUrls }),
      });
      setNewPost("");
      setSelectedImages([]);
      setImagePreviews([]);
      setShowCompose(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Compose */}
      <Card>
        {showCompose ? (
          <div className="space-y-3">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share a workout, PR, or fitness tip..."
              className="w-full bg-transparent text-text-primary placeholder:text-text-muted resize-none focus:outline-none text-sm min-h-[80px]"
              autoFocus
            />
            {imagePreviews.length > 0 && (
              <div className={`grid gap-2 ${imagePreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={selectedImages.length >= 4}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-green transition-colors disabled:opacity-40"
                >
                  <ImagePlus className="h-4 w-4" />
                  Photo {selectedImages.length > 0 && `(${selectedImages.length}/4)`}
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowCompose(false); setSelectedImages([]); setImagePreviews([]); }}>Cancel</Button>
                <Button size="sm" loading={posting || isUploading} onClick={submitPost} disabled={!newPost.trim()}>Post</Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="h-9 w-9 rounded-full bg-surface-elevated border border-border" />
            <span className="text-text-muted text-sm">Share your progress...</span>
            <Plus className="h-4 w-4 text-text-muted ml-auto" />
          </button>
        )}
      </Card>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">The feed is empty</h2>
          <p className="text-text-secondary text-sm mb-6">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => {
            const liked = likedPosts.has(post.id);
            const wasLiked = post.likes.some((l) => l.userId === currentUserId);
            const likeCount = post._count.likes + (liked && !wasLiked ? 1 : !liked && wasLiked ? -1 : 0);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={post.user.avatar} name={post.user.name ?? undefined} size="sm" />
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{post.user.name}</p>
                      <p className="text-xs text-text-muted">{formatRelativeTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">{post.content}</p>
                  {post.mediaUrls.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${post.mediaUrls.length === 1 ? "" : "grid-cols-2"}`}>
                      {post.mediaUrls.slice(0, 4).map((url, j) => (
                        <img key={j} src={url} alt="post media" className="rounded-xl object-cover w-full aspect-square" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-status-error" : "text-text-muted hover:text-status-error"}`}
                    >
                      <Heart className={`h-4 w-4 ${liked ? "fill-status-error" : ""}`} />
                      <span>{likeCount}</span>
                    </button>
                    <button
                      onClick={() => setCommentPost(post)}
                      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{commentCounts[post.id] ?? post._count.comments}</span>
                    </button>
                    <button
                      onClick={() => setSharePost(post)}
                      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors ml-auto"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>

    <AnimatePresence>
      {commentPost && (
        <CommentSheet
          key="comments"
          post={commentPost}
          onClose={() => setCommentPost(null)}
          onCommentAdded={(id) => setCommentCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))}
        />
      )}
      {sharePost && (
        <ShareSheet key="share" post={sharePost} onClose={() => setSharePost(null)} />
      )}
    </AnimatePresence>
    </>
  );
}
