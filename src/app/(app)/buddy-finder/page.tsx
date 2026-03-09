"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, MapPin, Target, MessageCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";

type Buddy = {
  id: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  goals: string[];
  gymLocation: string | null;
  activityLevel: string | null;
  _count: { workouts: number };
};

export default function BuddyFinderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/buddies")
      .then((r) => r.json())
      .then(setBuddies)
      .catch(() => toast({ title: "Failed to load buddies", variant: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleMessage = async (buddyId: string) => {
    setMessaging(buddyId);
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: buddyId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      router.push(`/messages/${data.id}`);
    } catch {
      toast({ title: "Failed to start conversation", variant: "error" });
    } finally {
      setMessaging(null);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="bg-accent-green/5 border-accent-green/20">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-accent-green" />
          <p className="font-bold text-text-primary">Find Your Training Partner</p>
        </div>
        <p className="text-sm text-text-secondary">
          Connect with gym-goers who share your goals. Sorted by matching goals.
        </p>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
        </div>
      ) : buddies.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="font-bold text-text-primary mb-1">No other users yet</p>
          <p className="text-sm text-text-secondary">Invite friends to join and find training partners here</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {buddies.map((buddy, i) => (
            <motion.div
              key={buddy.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start gap-3">
                  <Avatar name={buddy.name ?? buddy.username ?? "?"} src={buddy.avatar ?? undefined} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary">{buddy.name ?? buddy.username ?? "User"}</p>
                    {buddy.username && <p className="text-xs text-text-muted">@{buddy.username}</p>}
                    {buddy.gymLocation && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-text-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{buddy.gymLocation}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {buddy.goals.map((g) => (
                        <Badge key={g} variant="default" className="text-2xs">{g.replace(/_/g, " ")}</Badge>
                      ))}
                      <Badge variant="secondary" className="text-2xs">{buddy._count.workouts} workouts</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    leftIcon={<MessageCircle className="h-3.5 w-3.5" />}
                    variant="secondary"
                    loading={messaging === buddy.id}
                    onClick={() => handleMessage(buddy.id)}
                  >
                    Message
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="text-center py-6">
        <Target className="h-8 w-8 text-text-muted mx-auto mb-2" />
        <p className="text-sm text-text-secondary">
          Complete your profile to appear in buddy searches and find more matches.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/profile")}>
          Update Profile
        </Button>
      </Card>
    </div>
  );
}
