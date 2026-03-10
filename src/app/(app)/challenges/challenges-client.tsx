"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Calendar, Plus, Flame, X, ChevronRight, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

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

interface LeaderboardEntry {
  userId: string;
  name: string | null;
  avatar: string | null;
  rank: number;
  value: number;
  formatted: string;
}

const TYPE_CONFIG: Record<string, { label: string; description: string; unit: string }> = {
  CONSISTENCY:  { label: "Consistency",     description: "Most workouts logged in the period",     unit: "workouts"  },
  TOTAL_VOLUME: { label: "Total Volume",    description: "Most total weight lifted (kg × reps)",    unit: "kg volume" },
  STREAK:       { label: "Streak",          description: "Longest consecutive days with a workout", unit: "days"      },
  PR_BASED:     { label: "Personal Record", description: "Most new personal records set",           unit: "PRs"       },
};

const MEDAL_COLORS = ["text-yellow-400", "text-slate-400", "text-amber-600"];

// ── Create challenge sheet ────────────────────────────────────────────────────
function CreateChallengeSheet({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: Challenge) => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("CONSISTENCY");
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextMonth);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) { toast({ title: "Title is required", variant: "error" }); return; }
    if (new Date(startDate) >= new Date(endDate)) { toast({ title: "End date must be after start date", variant: "error" }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, startDate, endDate }),
      });
      if (!res.ok) throw new Error();
      const challenge = await res.json();
      onCreated(challenge);
      toast({ title: "Challenge created! 🏆", variant: "success" });
      onClose();
    } catch {
      toast({ title: "Failed to create challenge", variant: "error" });
    } finally {
      setLoading(false);
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
        className="relative w-full bg-surface rounded-t-3xl max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 rounded-full bg-border-strong mx-auto mt-3 shrink-0" />
        <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <p className="font-bold text-text-primary text-lg">Create Challenge</p>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="30-Day Consistency Challenge"
              className="w-full bg-surface-elevated rounded-xl border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Log at least 4 workouts per week for 30 days..."
              rows={3}
              className="w-full bg-surface-elevated rounded-xl border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 transition-colors resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-2">Challenge Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={cn(
                    "text-left px-3 py-2.5 rounded-xl border transition-all",
                    type === key
                      ? "border-accent-green bg-accent-green/10"
                      : "border-border bg-surface-elevated hover:border-border-strong"
                  )}
                >
                  <p className={cn("text-sm font-semibold", type === key ? "text-accent-green" : "text-text-primary")}>
                    {cfg.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 leading-tight">{cfg.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-elevated rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-green/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-elevated rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-green/50 transition-colors"
              />
            </div>
          </div>

          <Button size="lg" className="w-full" loading={loading} onClick={handleCreate}>
            Create Challenge
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Leaderboard modal ─────────────────────────────────────────────────────────
function LeaderboardModal({
  challenge,
  currentUserId,
  onClose,
}: {
  challenge: Challenge;
  currentUserId: string;
  onClose: () => void;
}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const typeCfg = TYPE_CONFIG[challenge.type] ?? { label: challenge.type, description: "", unit: "" };
  const isActive = new Date() >= new Date(challenge.startDate) && new Date() <= new Date(challenge.endDate);

  useState(() => {
    fetch(`/api/challenges/${challenge.id}`)
      .then((r) => r.json())
      .then((data) => { setLeaderboard(data.leaderboard); setLoading(false); })
      .catch(() => setLoading(false));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full bg-surface rounded-t-3xl max-h-[85dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 rounded-full bg-border-strong mx-auto mt-3 shrink-0" />
        <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-text-primary">{challenge.title}</p>
              {isActive && <Badge variant="success" className="text-2xs"><Flame className="h-2.5 w-2.5 mr-1" />Live</Badge>}
            </div>
            <p className="text-xs text-text-muted mt-0.5">{typeCfg.label} · {challenge._count.participants} participants</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-2 shrink-0">
          <p className="text-xs text-text-muted bg-surface-elevated rounded-xl px-3 py-2">{challenge.description || typeCfg.description}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {loading ? (
            <div className="space-y-2 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-border shrink-0" />
                  <div className="flex-1 h-4 bg-border rounded-lg" />
                  <div className="h-4 w-16 bg-border rounded-lg" />
                </div>
              ))}
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">No activity yet — be the first to log a workout!</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {leaderboard.map((entry) => {
                const isMe = entry.userId === currentUserId;
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                      isMe ? "bg-accent-green/10 border border-accent-green/20" : "bg-surface-elevated"
                    )}
                  >
                    <div className="w-7 text-center shrink-0">
                      {entry.rank <= 3 ? (
                        <Medal className={cn("h-5 w-5 mx-auto", MEDAL_COLORS[entry.rank - 1])} />
                      ) : (
                        <span className="text-sm font-bold text-text-muted">{entry.rank}</span>
                      )}
                    </div>
                    <Avatar src={entry.avatar ?? undefined} name={entry.name ?? "?"} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold truncate", isMe ? "text-accent-green" : "text-text-primary")}>
                        {entry.name ?? "Athlete"} {isMe && <span className="text-xs font-normal">(you)</span>}
                      </p>
                    </div>
                    <span className={cn("text-sm font-bold shrink-0", entry.value > 0 ? "text-text-primary" : "text-text-muted")}>
                      {entry.value > 0 ? entry.formatted : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ChallengesClient({
  challenges: initialChallenges,
  joinedChallengeIds,
  userId,
}: {
  challenges: Challenge[];
  joinedChallengeIds: Set<string>;
  userId: string;
}) {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState(initialChallenges);
  const [joined, setJoined] = useState(joinedChallengeIds);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const joinChallenge = async (e: React.MouseEvent, challengeId: string) => {
    e.stopPropagation();
    setJoiningId(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
      if (res.ok) {
        setJoined((prev) => new Set([...prev, challengeId]));
        setChallenges((prev) =>
          prev.map((c) => c.id === challengeId ? { ...c, _count: { participants: c._count.participants + 1 } } : c)
        );
        toast({ title: "Joined! Start logging workouts 💪", variant: "success" });
      }
    } catch {
      toast({ title: "Failed to join", variant: "error" });
    } finally {
      setJoiningId(null);
    }
  };

  const isActive = (c: Challenge) => new Date() >= new Date(c.startDate) && new Date() <= new Date(c.endDate);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">Challenges</h1>
          <p className="text-sm text-text-muted">Compete with others, track progress</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowCreate(true)}>
          Create
        </Button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No challenges yet</h2>
          <p className="text-text-secondary text-sm mb-6">Create the first challenge for your community</p>
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Create a Challenge
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge, i) => {
            const hasJoined = joined.has(challenge.id);
            const active = isActive(challenge);
            const typeCfg = TYPE_CONFIG[challenge.type];

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <Card hoverable>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-text-primary">{challenge.title}</h3>
                          {active && (
                            <Badge variant="success" className="text-2xs">
                              <Flame className="h-2.5 w-2.5 mr-1" /> Live
                            </Badge>
                          )}
                          {hasJoined && (
                            <Badge variant="default" className="text-2xs">
                              <Trophy className="h-2.5 w-2.5 mr-1" /> Joined
                            </Badge>
                          )}
                        </div>
                        {challenge.description && (
                          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                            {challenge.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted mb-3 flex-wrap">
                      <Badge variant="secondary">{typeCfg?.label ?? challenge.type}</Badge>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {challenge._count.participants} joined
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {active
                          ? `Ends ${new Date(challenge.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`
                          : new Date() < new Date(challenge.startDate)
                            ? `Starts ${new Date(challenge.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`
                            : "Ended"
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={challenge.creator.avatar} name={challenge.creator.name ?? undefined} size="xs" />
                        <span className="text-xs text-text-muted">{challenge.creator.name}</span>
                      </div>
                      {!hasJoined && (
                        <Button
                          size="sm"
                          loading={joiningId === challenge.id}
                          onClick={(e) => joinChallenge(e, challenge.id)}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </Card>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateChallengeSheet
            onClose={() => setShowCreate(false)}
            onCreated={(c) => setChallenges((prev) => [c, ...prev])}
          />
        )}
        {selectedChallenge && (
          <LeaderboardModal
            challenge={selectedChallenge}
            currentUserId={userId}
            onClose={() => setSelectedChallenge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
