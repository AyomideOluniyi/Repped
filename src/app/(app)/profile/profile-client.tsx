"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Dumbbell, Video, Users, Calendar, MapPin, Edit3, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  username: string | null;
  goals: string[];
  weight: number | null;
  height: number | null;
  age: number | null;
  gymLocation: string | null;
  createdAt: Date;
  role: string;
  _count: { workouts: number; personalRecords: number; videos: number; followers: number; following: number };
}

interface PersonalRecord {
  id: string;
  weight: number;
  reps: number;
  exercise: { name: string };
  date: Date;
}

export function ProfileClient({ user, recentPRs, isOwn, isFollowing: initialFollowing }: { user: UserProfile; recentPRs: PersonalRecord[]; isOwn: boolean; isFollowing?: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(user._count.followers);

  const toggleFollow = async () => {
    const next = !following;
    setFollowing(next);
    setFollowerCount((c) => c + (next ? 1 : -1));
    const res = await fetch(`/api/users/${user.id}/follow`, { method: next ? "POST" : "DELETE" });
    if (!res.ok) { setFollowing(!next); setFollowerCount((c) => c + (next ? -1 : 1)); }
  };

  const openMessage = async () => {
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: user.id }),
    });
    if (res.ok) {
      const conv = await res.json();
      router.push(`/messages/${conv.id}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      {/* Cover gradient */}
      <div className="h-32 bg-gradient-to-br from-accent-green/20 via-surface to-accent-orange/10" />

      <div className="px-4 pb-4 -mt-12 space-y-4">
        {/* Avatar + actions */}
        <div className="flex items-end justify-between">
          <Avatar src={user.avatar} name={user.name ?? undefined} size="xl" className="border-4 border-background" />
          {isOwn ? (
            <div className="flex gap-2">
              <Link href="/settings">
                <Button variant="secondary" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
                  Edit Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant={following ? "secondary" : "default"} onClick={toggleFollow}>
                {following ? "Following" : "Follow"}
              </Button>
              <Button size="sm" variant="secondary" onClick={openMessage} leftIcon={<MessageCircle className="h-3.5 w-3.5" />}>
                Message
              </Button>
            </div>
          )}
        </div>

        {/* Name + bio */}
        <div>
          <h1 className="text-2xl font-black font-display text-text-primary">{user.name ?? "Athlete"}</h1>
          {user.username && <p className="text-text-muted text-sm">@{user.username}</p>}
          {user.bio && <p className="text-text-secondary text-sm mt-2 leading-relaxed">{user.bio}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted flex-wrap">
            {user.gymLocation && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{user.gymLocation}</span>}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 py-3 border-y border-border">
          {[
            { label: "Workouts", value: user._count.workouts, icon: Dumbbell, href: "/workouts" },
            { label: "PRs", value: user._count.personalRecords, icon: Trophy, href: "/progress" },
            { label: "Videos", value: user._count.videos, icon: Video, href: "/videos" },
            { label: "Followers", value: followerCount, icon: Users, href: "#" },
            { label: "Following", value: user._count.following, icon: Users, href: "#" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="text-center group">
              <p className="text-xl font-black font-display text-text-primary group-hover:text-accent-green transition-colors">{stat.value}</p>
              <p className="text-2xs text-text-muted">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Goals */}
        {user.goals.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Goals</p>
            <div className="flex flex-wrap gap-2">
              {user.goals.map((goal) => (
                <Badge key={goal} variant="default">{goal.replace(/_/g, " ")}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent PRs */}
        {recentPRs.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Recent PRs</p>
            <div className="space-y-2">
              {recentPRs.slice(0, 3).map((pr) => (
                <Card key={pr.id} className="flex items-center justify-between py-2 px-3">
                  <p className="text-sm font-semibold text-text-primary">{pr.exercise.name}</p>
                  <p className="text-sm font-bold text-accent-green">{pr.weight}kg × {pr.reps}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
