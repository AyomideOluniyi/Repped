"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";

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

export function MessagesClient({ conversations, currentUserId }: { conversations: ConversationData[]; currentUserId: string }) {
  const [search, setSearch] = useState("");

  const getOtherUser = (conv: ConversationData) => {
    return conv.conversation.participants.find((p) => p.user.id !== currentUserId)?.user;
  };

  const filtered = conversations.filter((c) => {
    const other = getOtherUser(c);
    return other?.name?.toLowerCase().includes(search.toLowerCase()) ?? false;
  });

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Input
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No messages yet</h2>
          <p className="text-text-secondary text-sm mb-6">Find other users to start a conversation</p>
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
                        <p className={`font-semibold text-text-primary ${isUnread ? "text-text-primary" : "text-text-secondary"}`}>
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
    </div>
  );
}
