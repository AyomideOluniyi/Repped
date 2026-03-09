"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const FITNESS_GOALS = [
  { id: "BULKING", label: "Build Muscle", emoji: "💪" },
  { id: "CUTTING", label: "Lose Fat", emoji: "🔥" },
  { id: "STRENGTH", label: "Get Stronger", emoji: "🏋️" },
  { id: "ENDURANCE", label: "Improve Endurance", emoji: "🏃" },
  { id: "MAINTAINING", label: "Stay Fit", emoji: "⚡" },
];

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, goals: selectedGoals }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Registration failed");
      }

      // Auto sign in after registration
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch (err) {
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s === step ? "w-8 bg-accent-green" : s < step ? "w-4 bg-accent-green/50" : "w-4 bg-border"
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black font-display text-text-primary">
              Create account
            </h1>
            <p className="text-text-secondary mt-2">
              Your fitness journey starts here
            </p>
          </div>

          {/* Google Sign Up */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full mb-4"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            leftIcon={
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            }
          >
            Continue with Google
          </Button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              error={errors.name}
              leftIcon={<User className="h-4 w-4" />}
              autoComplete="name"
            />
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              autoComplete="new-password"
            />
            <Button size="lg" className="w-full" onClick={handleNext} rightIcon={<ArrowRight className="h-5 w-5" />}>
              Continue
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black font-display text-text-primary">
              What&apos;s your goal?
            </h2>
            <p className="text-text-secondary mt-2">
              Select all that apply. We will personalize your experience.
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {FITNESS_GOALS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() =>
                    setSelectedGoals((prev) =>
                      selected ? prev.filter((g) => g !== goal.id) : [...prev, goal.id]
                    )
                  }
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 text-left ${
                    selected
                      ? "border-accent-green bg-accent-green/10 text-accent-green"
                      : "border-border bg-surface-elevated text-text-primary hover:border-border-strong"
                  }`}
                >
                  <span className="text-2xl">{goal.emoji}</span>
                  <span className="font-semibold">{goal.label}</span>
                  {selected && (
                    <Check className="h-5 w-5 ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1"
              loading={loading}
              onClick={handleSubmit}
            >
              {selectedGoals.length === 0 ? "Skip for now" : "Get Started"}
            </Button>
          </div>
        </>
      )}

      {step === 1 && (
        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-green font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </motion.div>
  );
}
