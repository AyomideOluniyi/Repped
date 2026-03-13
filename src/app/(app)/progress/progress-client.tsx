"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Trophy, TrendingUp, Camera, Dumbbell, X, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { format } from "date-fns";

interface PersonalRecord {
  id: string;
  weight: number;
  reps: number;
  date: Date;
  exercise: { name: string };
}

interface WorkoutSummary {
  id: string;
  date: Date;
  sets: { weight: number | null; reps: number | null }[];
}

interface BodyMeasurement {
  id: string;
  weight: number | null;
  date: Date;
}

function LogMeasurementModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (m: BodyMeasurement) => void;
}) {
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const val = parseFloat(weight);
    if (!val || val <= 0) {
      toast({ title: "Enter a valid weight", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/progress/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: val }),
      });
      if (!res.ok) throw new Error();
      const m = await res.json();
      toast({ title: "Measurement saved!", variant: "success" });
      onSaved(m);
      onClose();
    } catch {
      toast({ title: "Failed to save", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-surface rounded-3xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold text-text-primary text-lg">Log Body Weight</p>
          <button onClick={onClose} className="text-text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">
            Weight (kg)
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 75.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            autoFocus
            className="w-full h-14 rounded-2xl bg-surface-elevated border border-border text-center text-2xl font-black font-display text-text-primary focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-border text-text-primary font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-accent-green text-black font-semibold text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPRModal({
  record,
  onClose,
  onSaved,
}: {
  record: PersonalRecord;
  onClose: () => void;
  onSaved: (updated: PersonalRecord) => void;
}) {
  const { toast } = useToast();
  const [weight, setWeight] = useState(String(record.weight));
  const [reps, setReps] = useState(String(record.reps));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || w <= 0 || !r || r <= 0) {
      toast({ title: "Enter valid weight and reps", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/progress/prs/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: w, reps: r }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "PR updated!", variant: "success" });
      onSaved({ ...record, weight: w, reps: r });
      onClose();
    } catch {
      toast({ title: "Failed to update", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-surface rounded-3xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-text-primary text-lg">Edit PR</p>
          <button onClick={onClose} className="text-text-muted"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-text-muted mb-5">{record.exercise.name}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Weight (kg)</label>
            <input
              type="number" inputMode="decimal" placeholder="e.g. 100"
              value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full h-14 rounded-2xl bg-surface-elevated border border-border text-center text-xl font-black font-display text-text-primary focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Reps</label>
            <input
              type="number" inputMode="numeric" placeholder="e.g. 5"
              value={reps} onChange={(e) => setReps(e.target.value)}
              className="w-full h-14 rounded-2xl bg-surface-elevated border border-border text-center text-xl font-black font-display text-text-primary focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green/30"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-border text-text-primary font-semibold text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-2xl bg-accent-green text-black font-semibold text-sm disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletePRModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-surface rounded-3xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-full bg-status-error/10 border border-status-error/20 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-status-error" />
          </div>
          <div>
            <p className="font-bold text-text-primary text-lg">Delete this PR?</p>
            <p className="text-sm text-text-muted mt-1">This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-border text-text-primary font-semibold text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-status-error text-white font-semibold text-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

export function ProgressClient({
  records: initialRecords,
  workouts,
  measurements: initialMeasurements,
}: {
  records: PersonalRecord[];
  workouts: WorkoutSummary[];
  measurements: BodyMeasurement[];
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<"records" | "volume" | "weight">("records");
  const [records, setRecords] = useState(initialRecords);
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null);
  const [deletingPR, setDeletingPR] = useState<PersonalRecord | null>(null);

  const handlePRDelete = async () => {
    if (!deletingPR) return;
    const id = deletingPR.id;
    setDeletingPR(null);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    const res = await fetch(`/api/progress/prs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast({ title: "Failed to delete PR", variant: "error" });
      setRecords(initialRecords);
    }
  };

  // Volume over time chart data
  const volumeData = workouts
    .slice(0, 12)
    .reverse()
    .map((w) => ({
      date: format(new Date(w.date), "MMM d"),
      volume: w.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0),
    }));

  // Weight over time
  const weightData = measurements
    .filter((m) => m.weight)
    .slice(0, 12)
    .reverse()
    .map((m) => ({
      date: format(new Date(m.date), "MMM d"),
      weight: m.weight,
    }));

  // Group PRs by exercise, keep best
  const bestRecords = Object.values(
    records.reduce<Record<string, PersonalRecord>>((acc, r) => {
      if (!acc[r.exercise.name] || r.weight > acc[r.exercise.name].weight) {
        acc[r.exercise.name] = r;
      }
      return acc;
    }, {})
  );

  const tabs = [
    { key: "records" as const, label: "PRs", icon: Trophy },
    { key: "volume" as const, label: "Volume", icon: TrendingUp },
    { key: "weight" as const, label: "Body Weight", icon: Dumbbell },
  ];

  return (
    <>
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-black font-display text-text-primary">{bestRecords.length}</p>
          <p className="text-xs text-text-muted">Exercises PR&apos;d</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-black font-display text-text-primary">{workouts.length}</p>
          <p className="text-xs text-text-muted">Workouts Logged</p>
        </Card>
        <Card className="text-center">
          <Link href="/progress/photos">
            <p className="text-2xl font-black font-display text-accent-green">
              <Camera className="h-6 w-6 mx-auto" />
            </p>
            <p className="text-xs text-text-muted">Progress Photos</p>
          </Link>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-elevated rounded-xl border border-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-background text-text-primary shadow-sm" : "text-text-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "records" && (
        <div>
          {bestRecords.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No PRs yet. Start logging workouts!</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {bestRecords.map((record) => (
                  <motion.div key={record.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-text-primary truncate">{record.exercise.name}</p>
                          <p className="text-xs text-text-muted">
                            {new Date(record.date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black font-display text-accent-green">
                            {record.weight}<span className="text-sm font-normal text-text-muted">kg</span>
                          </p>
                          <p className="text-xs text-text-muted">{record.reps} reps</p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditingPR(record)}
                            className="h-8 w-8 rounded-xl bg-surface-elevated flex items-center justify-center text-text-muted hover:text-accent-green transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingPR(record)}
                            className="h-8 w-8 rounded-xl bg-surface-elevated flex items-center justify-center text-text-muted hover:text-status-error transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {tab === "volume" && (
        <Card>
          <h3 className="font-bold text-text-primary mb-4">Training Volume</h3>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 10 }} />
                <YAxis tick={{ fill: "#666", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v) => [v != null ? `${Math.round(Number(v))}kg` : '', "Volume"]}
                />
                <Bar dataKey="volume" fill="#39FF14" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">Log workouts to see volume trends</p>
          )}
        </Card>
      )}

      {tab === "weight" && (
        <Card>
          <h3 className="font-bold text-text-primary mb-4">Body Weight</h3>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 10 }} />
                <YAxis tick={{ fill: "#666", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v) => [v != null ? `${v}kg` : '', "Weight"]}
                />
                <Line type="monotone" dataKey="weight" stroke="#39FF14" strokeWidth={2} dot={{ fill: "#39FF14", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">No measurements logged yet</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => setShowLogModal(true)}
          >
            Log Measurement
          </Button>
        </Card>
      )}
    </div>

    {showLogModal && (
      <LogMeasurementModal
        onClose={() => setShowLogModal(false)}
        onSaved={(m) => setMeasurements((prev) => [m, ...prev])}
      />
    )}

    {editingPR && (
      <EditPRModal
        record={editingPR}
        onClose={() => setEditingPR(null)}
        onSaved={(updated) => {
          setRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r));
          setEditingPR(null);
        }}
      />
    )}

    {deletingPR && (
      <DeletePRModal
        onConfirm={handlePRDelete}
        onCancel={() => setDeletingPR(null)}
      />
    )}
    </>
  );
}
