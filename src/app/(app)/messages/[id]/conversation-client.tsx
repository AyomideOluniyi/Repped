"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string | null;
  createdAt: Date;
  senderId: string;
  sender: { id: string; name: string | null; avatar: string | null };
}

interface ConversationClientProps {
  conversationId: string;
  currentUserId: string;
  otherUser: { id: string; name: string | null; avatar: string | null };
  initialMessages: Message[];
}

export function ConversationClient({ conversationId, currentUserId, otherUser, initialMessages }: ConversationClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Lift input above iOS keyboard using visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const kb = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, kb));
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  const scrollToBottom = useCallback((instant = false) => {
    bottomRef.current?.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(true); }, []); // instant on mount
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Poll for new messages every 3s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/messages/${conversationId}`);
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch {}
    };
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversationId]);

  const sendMessage = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      content,
      createdAt: new Date(),
      senderId: currentUserId,
      sender: { id: currentUserId, name: "You", avatar: null },
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const real = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? real : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Group messages by date
  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
    const last = acc[acc.length - 1];
    if (!last || last.date !== date) acc.push({ date, msgs: [msg] });
    else last.msgs.push(msg);
    return acc;
  }, []);

  return (
    <div
      className="flex flex-col bg-background"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
      }}
    >
      {/* Header — clears iOS status bar */}
      <div
        className="flex items-center gap-3 px-4 pb-3 border-b border-border bg-surface/80 backdrop-blur-xl shrink-0"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <button
          onClick={() => router.back()}
          className="text-text-muted hover:text-text-primary transition-colors p-1 -ml-1 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar src={otherUser.avatar ?? undefined} name={otherUser.name ?? "?"} size="sm" online />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary text-sm truncate">{otherUser.name ?? "User"}</p>
          <p className="text-xs text-accent-green">Active</p>
        </div>
      </div>

      {/* Messages — flex-1 with min-h-0 so it compresses when keyboard appears */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">{date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-1.5">
              {msgs.map((msg, i) => {
                const isMine = msg.senderId === currentUserId;
                const prevIsMine = i > 0 && msgs[i - 1].senderId === currentUserId;
                const showAvatar = !isMine && !prevIsMine;
                return (
                  <AnimatePresence key={msg.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}
                    >
                      {!isMine && (
                        <div className="w-6 shrink-0">
                          {showAvatar && <Avatar src={otherUser.avatar ?? undefined} name={otherUser.name ?? "?"} size="xs" />}
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed",
                          isMine
                            ? "bg-accent-green text-background rounded-br-md"
                            : "bg-surface-elevated text-text-primary rounded-bl-md"
                        )}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                );
              })}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-20">
            <Avatar src={otherUser.avatar ?? undefined} name={otherUser.name ?? "?"} size="xl" />
            <p className="font-semibold text-text-primary">{otherUser.name}</p>
            <p className="text-sm text-text-muted">Say hello and start the conversation!</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — rises above keyboard via keyboardOffset */}
      <div
        className="px-4 pt-3 border-t border-border bg-surface/80 backdrop-blur-xl shrink-0"
        style={{
          paddingBottom: keyboardOffset > 0
            ? `${keyboardOffset + 12}px`
            : "calc(env(safe-area-inset-bottom) + 0.75rem)",
        }}
      >
        <div className="flex items-center gap-2 bg-surface-elevated rounded-2xl border border-border px-4 py-2.5 focus-within:border-accent-green/50 transition-colors">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Message..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center transition-all shrink-0",
              text.trim() ? "bg-accent-green text-background" : "bg-border text-text-muted"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
