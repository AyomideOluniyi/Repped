"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Zap, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";

interface AIResult {
  foods: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  healthRating: number;
  healthNotes: string;
  suggestions: string[];
}

export default function MealScanPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleImage = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      try {
        const res = await fetch("/api/ai/meal-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        toast({ title: "Analysis failed", variant: "error" });
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const ratingColor = result
    ? result.healthRating >= 7 ? "text-status-success" : result.healthRating >= 4 ? "text-status-warning" : "text-status-error"
    : "";

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
      />

      {/* Camera / Upload area */}
      {!preview ? (
        <div className="space-y-3">
          <Card className="text-center py-12 bg-surface-elevated">
            <Camera className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <p className="font-bold text-text-primary mb-1">Scan Your Meal</p>
            <p className="text-sm text-text-secondary mb-6">AI will analyze calories, macros, and healthiness</p>
            <div className="flex gap-3 justify-center">
              <Button leftIcon={<Camera className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
                Take Photo
              </Button>
              <Button variant="secondary" leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute("capture"); fileRef.current.click(); } }}>
                Upload
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-2xl overflow-hidden">
            <img src={preview} alt="Meal" className="w-full max-h-64 object-cover" />
            {!analyzing && !result && (
              <button
                onClick={() => { setPreview(null); setResult(null); }}
                className="absolute top-3 right-3 h-8 w-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Analyzing spinner */}
          {analyzing && (
            <Card className="text-center py-6">
              <div className="h-10 w-10 rounded-full border-2 border-accent-green border-t-transparent animate-spin mx-auto mb-3" />
              <p className="font-semibold text-text-primary">Analyzing your meal...</p>
              <p className="text-sm text-text-muted mt-1">AI is identifying ingredients</p>
            </Card>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Health rating */}
                <Card className={`border-2 ${result.healthRating >= 7 ? "border-status-success/30 bg-status-success/5" : result.healthRating >= 4 ? "border-status-warning/30 bg-status-warning/5" : "border-status-error/30 bg-status-error/5"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-text-primary">Health Score</p>
                    <p className={`text-4xl font-black font-display ${ratingColor}`}>{result.healthRating}<span className="text-lg text-text-muted">/10</span></p>
                  </div>
                  <p className="text-sm text-text-secondary">{result.healthNotes}</p>
                </Card>

                {/* Totals */}
                <Card>
                  <p className="font-bold text-text-primary mb-3">Nutrition Summary</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Cal", value: Math.round(result.totals.calories) },
                      { label: "Protein", value: `${Math.round(result.totals.protein)}g` },
                      { label: "Carbs", value: `${Math.round(result.totals.carbs)}g` },
                      { label: "Fat", value: `${Math.round(result.totals.fat)}g` },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-2 bg-surface-elevated rounded-xl">
                        <p className="text-lg font-black font-display text-text-primary">{value}</p>
                        <p className="text-2xs text-text-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Food items */}
                <Card>
                  <p className="font-bold text-text-primary mb-3">Identified Foods</p>
                  <div className="space-y-2">
                    {result.foods.map((food, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-t border-border/50">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{food.name}</p>
                          <p className="text-xs text-text-muted">{food.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-text-secondary">{Math.round(food.calories)} cal</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <Card className="bg-accent-green/5 border-accent-green/20">
                    <p className="font-bold text-text-primary mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent-green" />AI Suggestions
                    </p>
                    <div className="space-y-1.5">
                      {result.suggestions.map((s, i) => (
                        <div key={i} className="flex gap-2">
                          <Check className="h-3.5 w-3.5 text-accent-green mt-0.5 shrink-0" />
                          <p className="text-sm text-text-secondary">{s}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Button className="w-full" onClick={() => { setPreview(null); setResult(null); }}>
                  Scan Another Meal
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
