"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { useUploadThing } from "@/lib/uploadthing";

const FITNESS_GOALS = ["BULKING", "CUTTING", "MAINTAINING", "STRENGTH", "ENDURANCE", "GENERAL_FITNESS"];

type Profile = {
  name: string;
  username: string;
  bio: string;
  gymLocation: string;
  goals: string[];
  weight: string;
  height: string;
  age: string;
  avatar: string | null;
  email: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({ name: "", username: "", bio: "", gymLocation: "", goals: [], weight: "", height: "", age: "", avatar: null, email: "" });

  const { startUpload, isUploading } = useUploadThing("imageUploader");

  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((data) => setProfile({
        name: data.name ?? "",
        username: data.username ?? "",
        bio: data.bio ?? "",
        gymLocation: data.gymLocation ?? "",
        goals: data.goals ?? [],
        weight: data.weight ? String(data.weight) : "",
        height: data.height ? String(data.height) : "",
        age: data.age ? String(data.age) : "",
        avatar: data.avatar,
        email: data.email ?? "",
      }))
      .finally(() => setLoading(false));
  }, []);

  const toggleGoal = (g: string) =>
    setProfile((p) => ({ ...p, goals: p.goals.includes(g) ? p.goals.filter((x) => x !== g) : [...p.goals, g] }));

  const handleAvatarChange = async (file: File) => {
    const uploaded = await startUpload([file]);
    if (uploaded?.[0]) {
      setProfile((p) => ({ ...p, avatar: uploaded[0].ufsUrl }));
      await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: uploaded[0].ufsUrl }),
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name || undefined,
          username: profile.username || undefined,
          bio: profile.bio || undefined,
          gymLocation: profile.gymLocation || undefined,
          goals: profile.goals,
          weight: profile.weight ? parseFloat(profile.weight) : undefined,
          height: profile.height ? parseFloat(profile.height) : undefined,
          age: profile.age ? parseInt(profile.age) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast({ title: "Profile updated!", variant: "success" });
      router.push("/settings");
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to save", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 rounded-full border-2 border-accent-green border-t-transparent animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Avatar */}
      <Card className="flex flex-col items-center py-6 gap-3">
        <div className="relative">
          <Avatar name={profile.name || "?"} src={profile.avatar ?? undefined} size="xl" />
          <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-accent-green flex items-center justify-center cursor-pointer shadow-md">
            <Camera className="h-3.5 w-3.5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
          </label>
        </div>
        {isUploading && <p className="text-xs text-text-muted">Uploading...</p>}
        <p className="text-sm text-text-muted">{profile.email}</p>
      </Card>

      <Input label="Display Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
      <Input label="Username" value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value.toLowerCase() }))} placeholder="e.g. strongjohn" />
      <Input label="Bio" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell others about yourself..." />
      <Input label="Gym Location" value={profile.gymLocation} onChange={(e) => setProfile((p) => ({ ...p, gymLocation: e.target.value }))} placeholder="e.g. PureGym London" />

      <div className="grid grid-cols-3 gap-3">
        <Input label="Weight (kg)" type="number" value={profile.weight} onChange={(e) => setProfile((p) => ({ ...p, weight: e.target.value }))} placeholder="75" />
        <Input label="Height (cm)" type="number" value={profile.height} onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))} placeholder="180" />
        <Input label="Age" type="number" value={profile.age} onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))} placeholder="25" />
      </div>

      <div>
        <label className="text-sm text-text-secondary mb-2 block">Fitness Goals</label>
        <div className="flex flex-wrap gap-2">
          {FITNESS_GOALS.map((g) => (
            <button
              key={g}
              onClick={() => toggleGoal(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                profile.goals.includes(g) ? "border-accent-green bg-accent-green/10 text-accent-green" : "border-border bg-surface-elevated text-text-secondary"
              }`}
            >
              {g.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full" loading={saving} leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
        Save Changes
      </Button>
    </motion.div>
  );
}
