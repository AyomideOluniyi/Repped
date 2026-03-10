"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, X, SquarePen } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ConversationData {
  id: string;
  conversation: {
    id: string;
    type: string;
    name: string | null;
    participants: { user: { id: string; name: string | null; avatar: string | null } }[];
    messages: { content: string | null; createdAt: Date; senderId: string }[];
    updatedAt: Date;
  };
}

interface UserResult {
  id: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
}

function NewMessageModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/buddies")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = users.filter((u) =>
    (u.name ?? u.username ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const startConversation = async (userId: string) => {
    setStarting(userId);
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: userId }),
    });
    if (res.ok) {
      const conv = await res.json();
      onClose();
      router.push(`/messages/${conv.id}`);
    } else {
      setStarting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full bg-surface rounded-t-3xl max-h-[80dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 rounded-full bg-border-strong mx-auto mt-3 shrink-0" />
        <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <p className="font-bold text-text-primary">New Message</p>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated border border-border">
            <Search className="h-4 w-4 text-text-muted shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {users.length === 0 ? (
            <p className="text-center py-8 text-sm text-text-muted">Follow people to message them</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-6 text-sm text-text-muted">No results</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startConversation(u.id)}
                  disabled={!!starting}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-elevated transition-colors text-left"
                >
                  <Avatar src={u.avatar ?? undefined} name={u.name ?? u.username ?? "?"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{u.name ?? u.username}</p>
                    {u.username && <p className="text-xs text-text-muted">@{u.username}</p>}
                  </div>
                  {starting === u.id ? (
                    <div className="h-4 w-4 rounded-full border-2 border-accent-green border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-text-muted shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function MessagesClient({ conversations, currentUserId }: { conversations: ConversationData[]; currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);

  const getOtherUser = (conv: ConversationData) => {
    return conv.conversation.participants.find((p) => p.user.id !== currentUserId)?.user;
  };

  const filtered = conversations.filter((c) => {
    const other = getOtherUser(c);
    return other?.name?.toLowerCase().includes(search.toLowerCase()) ?? false;
  });

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="flex-1"
        />
        <button
          onClick={() => setShowNewMessage(true)}
          className="h-10 w-10 shrink-0 rounded-xl bg-accent-green flex items-center justify-center text-background shadow-glow"
        >
          <SquarePen className="h-4 w-4" />
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No messages yet</h2>
          <p className="text-text-secondary text-sm mb-6">Start a conversation with someone you follow</p>
          <button
            onClick={() => setShowNewMessage(true)}
            className="px-5 py-2.5 bg-accent-green text-background font-bold rounded-2xl text-sm"
          >
            New Message
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((conv, i) => {
            const other = getOtherUser(conv);
            const lastMessage = conv.conversation.messages[0];
            const isUnread = !lastMessage || (lastMessage.senderId !== currentUserId);

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/messages/${conv.conversation.id}`}>
                  <Card hoverable className="flex items-center gap-3">
                    <Avatar src={other?.avatar} name={other?.name ?? undefined} size="md" online />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn("font-semibold", isUnread ? "text-text-primary" : "text-text-secondary")}>
                          {other?.name ?? "Unknown"}
                        </p>
                        {lastMessage && (
                          <p className="text-xs text-text-muted">{formatRelativeTime(lastMessage.createdAt)}</p>
                        )}
                      </div>
                      <p className="text-sm text-text-muted truncate mt-0.5">
                        {lastMessage?.content ?? "No messages yet"}
                      </p>
                    </div>
                    {isUnread && lastMessage && (
                      <div className="h-2.5 w-2.5 rounded-full bg-accent-green shrink-0" />
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showNewMessage && (
          <NewMessageModal onClose={() => setShowNewMessage(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
