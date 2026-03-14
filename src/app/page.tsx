import Link from "next/link";
import { ArrowRight, Dumbbell, Brain, Camera, Users, Trophy, Zap, Shield, Smartphone, Play } from "lucide-react";
import { prisma } from "@/lib/prisma";

const FEATURES = [
  { icon: Dumbbell, title: "Smart Workout Tracker", desc: "Log workouts with lightning speed. Auto-detect PRs, track volume, and visualize your progression over time.", color: "text-accent-green", bg: "bg-accent-green/10", border: "group-hover:border-accent-green/30" },
  { icon: Camera, title: "AI Meal Scanner", desc: "Point your camera at any meal. Get instant calorie counts, macros, and health scores powered by GPT-4.", color: "text-accent-orange", bg: "bg-accent-orange/10", border: "group-hover:border-accent-orange/30" },
  { icon: Brain, title: "Equipment Identifier", desc: "New to a gym machine? AI identifies equipment and shows you exactly how to use it safely.", color: "text-status-info", bg: "bg-status-info/10", border: "group-hover:border-status-info/30" },
  { icon: Zap, title: "AI Workout Generator", desc: "Tell the AI your goals, available equipment, and schedule. Get a complete weekly plan in seconds.", color: "text-status-warning", bg: "bg-status-warning/10", border: "group-hover:border-status-warning/30" },
  { icon: Users, title: "Community and Challenges", desc: "Share PRs, join 30-day challenges, find gym buddies near you, and level up together.", color: "text-accent-green", bg: "bg-accent-green/10", border: "group-hover:border-accent-green/30" },
  { icon: Trophy, title: "Progress Tracking", desc: "Progress photos, body measurements, and strength standards. See exactly how far you have come.", color: "text-status-warning", bg: "bg-status-warning/10", border: "group-hover:border-status-warning/30" },
];

const HOW_IT_WORKS = (count: number) => [
  { step: "01", title: "Sign up in seconds", desc: "Create your account with email or Google. Set your fitness goals and we will personalize the experience for you." },
  { step: "02", title: "Log your first workout", desc: `Search our database of ${count} exercises, log your sets and reps, and let REPPED track your progress automatically.` },
  { step: "03", title: "Watch yourself improve", desc: "Charts, PRs, streaks, and AI-generated insights show you exactly how far you have come and where to go next." },
];

export default async function LandingPage() {
  const exerciseCount = await prisma.exercise.count();
  const STATS = [
    { value: String(exerciseCount), label: "Exercises" },
    { value: "AI", label: "Powered" },
    { value: "PWA", label: "Works Offline" },
    { value: "Free", label: "Always" },
  ];
  return (
    <div className="min-h-screen bg-background text-text-primary font-body overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-accent-green flex items-center justify-center shadow-glow">
              <span className="text-lg font-black font-display text-background">R</span>
            </div>
            <span className="text-lg font-black font-display tracking-tight">REPPED</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-accent-green text-background text-sm font-bold px-4 py-2 rounded-xl hover:bg-accent-green-dim transition-all shadow-glow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-accent-green/6 blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-0 h-72 w-72 rounded-full bg-accent-orange/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-status-info/4 blur-3xl pointer-events-none" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,.4) 1px,transparent 1px)", backgroundSize: "64px 64px" }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-green/30 bg-accent-green/8 text-accent-green text-xs font-semibold mb-8">
            <Smartphone className="h-3.5 w-3.5" />
            Install on your phone. No App Store needed.
          </div>

          <h1 className="text-5xl md:text-7xl font-black font-display text-text-primary leading-[0.92] tracking-tight mb-6">
            The gym app
            <br />
            <span className="text-accent-green" style={{ textShadow: "0 0 60px rgba(57,255,20,0.2)" }}>you actually</span>
            <br />
            want to use.
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Track workouts, scan meals with AI, find gym buddies, and watch yourself get stronger every week.
            REPPED is the all-in-one fitness companion that works everywhere, even offline.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-accent-green text-background font-bold px-8 py-4 rounded-2xl hover:bg-accent-green-dim transition-all shadow-glow text-lg"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/reels"
              className="inline-flex items-center justify-center gap-2 border border-border-strong bg-surface-elevated text-text-primary font-bold px-8 py-4 rounded-2xl hover:border-accent-green/40 transition-all text-lg"
            >
              <Play className="h-5 w-5 fill-current" />
              Watch Reels
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl border border-border bg-surface-elevated/60">
              <p className="text-2xl md:text-3xl font-black font-display text-accent-green">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black font-display text-text-primary mb-3">
              Everything you need.
              <br />
              <span className="text-accent-green">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              REPPED combines all the tools serious athletes need into one beautifully designed app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group p-6 rounded-2xl border border-border bg-background hover:bg-surface-elevated ${feature.border} transition-all duration-300`}
                >
                  <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-text-primary text-lg mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black font-display text-text-primary mb-3">Get started in minutes</h2>
            <p className="text-text-secondary">No complicated setup. Just sign up and start training.</p>
          </div>

          <div className="relative">
            <div className="absolute left-[1.625rem] top-12 bottom-12 w-px bg-gradient-to-b from-accent-green/50 via-accent-green/20 to-transparent hidden sm:block" />
            <div className="space-y-4">
              {HOW_IT_WORKS(exerciseCount).map((step) => (
                <div key={step.step} className="flex gap-5 p-5 rounded-2xl border border-border bg-surface-elevated hover:border-border-strong transition-colors">
                  <div className="h-12 w-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0 relative z-10">
                    <span className="text-sm font-black font-display text-accent-green">{step.step}</span>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-text-primary text-lg mb-1">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reels teaser */}
      <section className="px-4 py-20 bg-surface overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-green/30 bg-accent-green/8 text-accent-green text-xs font-semibold mb-6">
            <Play className="h-3.5 w-3.5 fill-current" />
            Workout Reels
          </div>
          <h2 className="text-4xl font-black font-display text-text-primary mb-4">
            Get inspired.
            <br />
            <span className="text-accent-green">Every single day.</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            Watch workout videos from elite athletes and everyday gym-goers. Learn new techniques, get motivated, and share your own training.
          </p>
          <Link href="/reels" className="inline-flex items-center gap-2 border border-border-strong bg-surface-elevated text-text-primary font-bold px-8 py-4 rounded-2xl hover:border-accent-green/40 transition-all">
            <Play className="h-5 w-5 fill-current text-accent-green" />
            Browse Reels
          </Link>
        </div>
      </section>

      {/* PWA section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface-elevated text-text-secondary text-xs font-semibold mb-6">
            <Shield className="h-3.5 w-3.5 text-accent-green" />
            Works on iPhone, Android and Desktop
          </div>
          <h2 className="text-4xl font-black font-display text-text-primary mb-4">
            Install it like a native app.
            <br />
            <span className="text-accent-green">No App Store required.</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            REPPED is a Progressive Web App. Add it to your home screen and it works exactly like a native app:
            full-screen, offline support, push notifications, without the App Store restrictions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-border bg-surface-elevated flex-1">
              <span className="text-2xl">📱</span>
              <div className="text-left">
                <p className="text-xs text-text-muted">iPhone</p>
                <p className="text-sm font-semibold text-text-primary">Tap Share then Add to Home Screen</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-border bg-surface-elevated flex-1">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <p className="text-xs text-text-muted">Android</p>
                <p className="text-sm font-semibold text-text-primary">Tap the menu then Install App</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-green/3 to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-black font-display text-text-primary mb-4">
            Ready to get <span className="text-accent-green">REPPED</span>?
          </h2>
          <p className="text-text-secondary mb-10 text-lg">
            Join athletes around the world who are already training smarter with REPPED.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-accent-green text-background font-bold px-12 py-5 rounded-2xl hover:bg-accent-green-dim transition-all shadow-glow text-xl"
          >
            Start Training
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent-green flex items-center justify-center shadow-glow">
              <span className="text-sm font-black font-display text-background">R</span>
            </div>
            <span className="font-black font-display text-text-primary">REPPED</span>
          </div>
          <p className="text-sm text-text-muted">Your all-in-one fitness companion.</p>
          <div className="flex gap-5 text-sm text-text-muted">
            <Link href="/login" className="hover:text-text-primary transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-text-primary transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
