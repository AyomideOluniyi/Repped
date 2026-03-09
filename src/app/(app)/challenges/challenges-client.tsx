"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Plus, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { formatRelativeTime } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  isPublic: boolean;
  creator: { id: string; name: string | null; avatar: string | null };
  _count: { participants: number };
}

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  STREAK: "Streak",
  TOTAL_VOLUME: "Volume",
  PR_BASED: "Personal Record",
  CONSISTENCY: "Consistency",
  STEPS: "Steps",
};

export function ChallengesClient({
  challenges,
  joinedChallengeIds,
  userId,
}: {
  challenges: Challenge[];
  joinedChallengeIds: Set<string>;
  userId: string;
}) {
  const { toast } = useToast();
  const [joined, setJoined] = useState(joinedChallengeIds);
  const [loading, setLoading] = useState<string | null>(null);

  const joinChallenge = async (challengeId: string) => {
    setLoading(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
      if (res.ok) {
        setJoined((prev) => new Set([...prev, challengeId]));
        toast({ title: "Joined challenge! 🏆", variant: "success" });
      }
    } catch {
      toast({ title: "Failed to join", variant: "error" });
    } finally {
      setLoading(null);
    }
  };

  const isActive = (c: Challenge) => new Date() >= new Date(c.startDate) && new Date() <= new Date(c.endDate);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {challenges.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No challenges yet</h2>
          <p className="text-text-secondary text-sm">Check back soon for community challenges</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge, i) => {
            const hasJoined = joined.has(challenge.id);
            const active = isActive(challenge);

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-text-primary">{challenge.title}</h3>
                        {active && (
                          <Badge variant="success" className="text-2xs">
                            <Flame className="h-2.5 w-2.5 mr-1" /> Live
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{challenge.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-muted mb-3 flex-wrap">
                    <Badge variant="secondary">{CHALLENGE_TYPE_LABELS[challenge.type] ?? challenge.type}</Badge>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {challenge._count.participants} joined
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Ends {new Date(challenge.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar src={challenge.creator.avatar} name={challenge.creator.name ?? undefined} size="xs" />
                      <span className="text-xs text-text-muted">{challenge.creator.name}</span>
                    </div>
                    {hasJoined ? (
                      <Badge variant="default">
                        <Trophy className="h-3 w-3 mr-1" /> Joined
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        loading={loading === challenge.id}
                        onClick={() => joinChallenge(challenge.id)}
                      >
                        Join
                      </Button>
                    )}
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
