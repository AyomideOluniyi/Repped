"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Dumbbell, AlertCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface EquipmentResult {
  name: string;
  category: string;
  primaryMuscles: string[];
  exercises: { name: string; description: string; difficulty: string }[];
  setupInstructions: string;
  commonMistakes: string[];
  adjustmentTips: string;
}

export default function EquipmentScanPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<EquipmentResult | null>(null);

  const handleImage = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      try {
        const res = await fetch("/api/ai/equipment-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        toast({ title: "Identification failed", variant: "error" });
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
      />

      {!preview ? (
        <Card className="text-center py-12 bg-surface-elevated">
          <Dumbbell className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <p className="font-bold text-text-primary mb-1">Identify Gym Equipment</p>
          <p className="text-sm text-text-secondary mb-6">
            Take a photo of any machine or equipment and AI will tell you what it is and how to use it
          </p>
          <div className="flex gap-3 justify-center">
            <Button leftIcon={<Camera className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
              Take Photo
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.removeAttribute("capture");
                  fileRef.current.click();
                }
              }}
            >
              Upload
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-2xl overflow-hidden">
            <img src={preview} alt="Equipment" className="w-full max-h-56 object-cover" />
            {!analyzing && !result && (
              <button
                onClick={() => { setPreview(null); setResult(null); }}
                className="absolute top-3 right-3 h-8 w-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {analyzing && (
            <Card className="text-center py-6">
              <div className="h-10 w-10 rounded-full border-2 border-accent-green border-t-transparent animate-spin mx-auto mb-3" />
              <p className="font-semibold text-text-primary">Identifying equipment...</p>
              <p className="text-sm text-text-muted mt-1">AI is analyzing the image</p>
            </Card>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Equipment name */}
                <Card>
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
                      <Dumbbell className="h-6 w-6 text-accent-green" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black font-display text-text-primary">{result.name}</h2>
                      <p className="text-sm text-text-muted">{result.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.primaryMuscles.map((m) => (
                      <Badge key={m} variant="default">{m}</Badge>
                    ))}
                  </div>
                </Card>

                {/* Exercises */}
                <Card>
                  <h3 className="font-bold text-text-primary mb-3">Exercises You Can Do</h3>
                  <div className="space-y-3">
                    {result.exercises.map((ex, i) => (
                      <div key={i} className="flex gap-3 py-2 border-t border-border/50">
                        <div className="h-6 w-6 rounded-full bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-accent-green">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-text-primary text-sm">{ex.name}</p>
                            <Badge variant="secondary" className="text-2xs">{ex.difficulty}</Badge>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{ex.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Setup instructions */}
                <Card>
                  <h3 className="font-bold text-text-primary mb-2">Setup Instructions</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{result.setupInstructions}</p>
                  {result.adjustmentTips && (
                    <p className="text-sm text-text-muted mt-2 italic">{result.adjustmentTips}</p>
                  )}
                </Card>

                {/* Common mistakes */}
                {result.commonMistakes.length > 0 && (
                  <Card>
                    <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-status-warning" />
                      Common Mistakes
                    </h3>
                    <div className="space-y-1.5">
                      {result.commonMistakes.map((m, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-status-warning mt-2 shrink-0" />
                          <p className="text-sm text-text-secondary">{m}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Button className="w-full" onClick={() => { setPreview(null); setResult(null); }}>
                  Scan Another
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
