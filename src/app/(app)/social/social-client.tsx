"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Plus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  createdAt: Date;
  user: { id: string; name: string | null; avatar: string | null; username: string | null };
  likes: { userId: string }[];
  _count: { likes: number; comments: number };
}

export function SocialClient({ posts, currentUserId }: { posts: Post[]; currentUserId: string }) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    new Set(posts.filter((p) => p.likes.some((l) => l.userId === currentUserId)).map((p) => p.id))
  );
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const toggleLike = async (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    // API call to toggle like
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  };

  const submitPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost }),
    });
    setNewPost("");
    setShowCompose(false);
    setPosting(false);
  };

  return (
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
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button size="sm" loading={posting} onClick={submitPost} disabled={!newPost.trim()}>Post</Button>
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
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={post.user.avatar} name={post.user.name ?? undefined} size="sm" />
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{post.user.name}</p>
                      <p className="text-xs text-text-muted">{formatRelativeTime(post.createdAt)}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">{post.content}</p>

                  {/* Media */}
                  {post.mediaUrls.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${post.mediaUrls.length === 1 ? "" : "grid-cols-2"}`}>
                      {post.mediaUrls.slice(0, 4).map((url, j) => (
                        <img key={j} src={url} alt="post media" className="rounded-xl object-cover w-full aspect-square" />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-status-error" : "text-text-muted hover:text-status-error"}`}
                    >
                      <Heart className={`h-4 w-4 ${liked ? "fill-status-error" : ""}`} />
                      <span>{post._count.likes + (liked && !post.likes.some(l => l.userId === currentUserId) ? 1 : liked ? 0 : -0)}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post._count.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors ml-auto">
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
  );
}
