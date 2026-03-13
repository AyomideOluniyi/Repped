"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Calendar, Clock, Trash2, Share2, Trophy, X, Search, Check, Send, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDuration } from "@/lib/utils";

interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  exercise: { id: string; name: string; muscleGroups: string[] };
}

interface Workout {
  id: string;
  name: string;
  date: Date;
  duration: number | null;
  notes: string | null;
  sets: WorkoutSet[];
}

// ── Share modal ────────────────────────────────────────────────────────────────
function ShareModal({ workout, onClose }: { workout: Workout; onClose: () => void }) {
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
    const totalVolume = workout.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
    const exerciseCount = new Set(workout.sets.map((s) => s.exercise.id)).size;
    const content = `Check out my workout: ${workout.name}\n${exerciseCount} exercises · ${Math.round(totalVolume)}kg volume${workout.duration ? ` · ${formatDuration(workout.duration)}` : ""}`;
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
          <p className="font-bold text-text-primary">Share workout</p>
          <button onClick={onClose} className="text-text-muted"><X className="h-5 w-5" /></button>
        </div>

        {/* Workout preview */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-elevated">
            <div className="h-10 w-10 rounded-lg bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
              <Dumbbell className="h-5 w-5 text-accent-green" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary line-clamp-1">{workout.name}</p>
              <p className="text-xs text-text-muted">{new Set(workout.sets.map((s) => s.exercise.id)).size} exercises · {Math.round(workout.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0))}kg</p>
            </div>
          </div>
        </div>

        {/* Search */}
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

        {/* Users list */}
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

        {/* Send button */}
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

// ── Delete confirm modal ────────────────────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-surface rounded-3xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-full bg-status-error/10 border border-status-error/20 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-status-error" />
          </div>
          <div>
            <p className="font-bold text-text-primary text-lg">Delete workout?</p>
            <p className="text-sm text-text-muted mt-1">This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-border text-text-primary font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-status-error text-white font-semibold text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkoutDetailClient({ workout }: { workout: Workout }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Group sets by exercise
  const groupedSets = workout.sets.reduce<Record<string, { name: string; muscleGroups: string[]; sets: WorkoutSet[] }>>((acc, set) => {
    const key = set.exercise.id;
    if (!acc[key]) acc[key] = { name: set.exercise.name, muscleGroups: set.exercise.muscleGroups, sets: [] };
    acc[key].sets.push(set);
    return acc;
  }, {});

  const totalVolume = workout.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
  const totalSets = workout.sets.length;

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    const res = await fetch(`/api/workouts/${workout.id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Workout deleted", variant: "success" });
      await new Promise((r) => setTimeout(r, 900));
      router.push("/workouts");
    } else {
      toast({ title: "Failed to delete", variant: "error" });
      setDeleting(false);
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4 max-w-2xl mx-auto"
    >
      {/* Workout summary */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
            <Dumbbell className="h-6 w-6 text-accent-green" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black font-display text-text-primary">{workout.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(workout.date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
              </span>
              {workout.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(workout.duration)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-black font-display text-text-primary">{Object.keys(groupedSets).length}</p>
            <p className="text-xs text-text-muted">Exercises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black font-display text-text-primary">{totalSets}</p>
            <p className="text-xs text-text-muted">Total Sets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black font-display text-text-primary">{Math.round(totalVolume)}</p>
            <p className="text-xs text-text-muted">kg Volume</p>
          </div>
        </div>
      </Card>

      {/* Exercises */}
      {Object.entries(groupedSets).map(([exerciseId, group]) => (
        <Card key={exerciseId}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-text-primary">{group.name}</p>
              <div className="flex gap-1 mt-0.5">
                {group.muscleGroups.slice(0, 2).map((m) => (
                  <Badge key={m} variant="secondary" className="text-2xs">
                    {m.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
            <Trophy className="h-4 w-4 text-status-warning opacity-0" />
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-2 mb-2 px-1">
            {["Set", "Weight", "Reps", "Vol"].map((h) => (
              <span key={h} className="text-2xs text-text-muted text-center">{h}</span>
            ))}
          </div>

          {/* Sets */}
          {group.sets.map((set, i) => (
            <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-2 py-1.5 border-t border-border/50 items-center">
              <span className="text-sm font-bold text-text-muted text-center">{i + 1}</span>
              <span className="text-sm font-semibold text-text-primary text-center">
                {set.weight ? `${set.weight}kg` : "—"}
              </span>
              <span className="text-sm font-semibold text-text-primary text-center">
                {set.reps ?? "—"}
              </span>
              <span className="text-sm text-text-secondary text-center">
                {set.weight && set.reps ? Math.round(set.weight * set.reps) : "—"}
              </span>
            </div>
          ))}
        </Card>
      ))}

      {workout.notes && (
        <Card>
          <p className="text-sm font-semibold text-text-secondary mb-1">Notes</p>
          <p className="text-sm text-text-primary">{workout.notes}</p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          leftIcon={<Share2 className="h-4 w-4" />}
          onClick={() => setShowShare(true)}
        >
          Share
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          leftIcon={<Trash2 className="h-4 w-4" />}
          loading={deleting}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete
        </Button>
      </div>
    </motion.div>

    {showDeleteConfirm && (
      <DeleteConfirmModal
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    )}
    {showShare && (
      <ShareModal workout={workout} onClose={() => setShowShare(false)} />
    )}
    </>
  );
}
