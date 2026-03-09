"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Upload, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useUploadThing } from "@/lib/uploadthing";

type FormResult = {
  exercise: string;
  rating: number;
  feedback: { type: "positive" | "issue"; point: string }[];
  cues: string[];
};

export default function FormCheckPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [exercise, setExercise] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);

  const { startUpload } = useUploadThing("videoUploader");

  const handleVideo = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file || !exercise.trim()) {
      toast({ title: "Please select a video and enter the exercise name", variant: "error" });
      return;
    }
    setAnalyzing(true);
    try {
      await startUpload([file]);

      const res = await fetch("/api/ai/form-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise: exercise.trim() }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
    } catch {
      toast({ title: "Analysis failed, please try again", variant: "error" });
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setExercise("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideo(f); }}
      />

      {!preview ? (
        <Card className="text-center py-12">
          <Video className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <p className="font-bold text-text-primary mb-1">AI Form Checker</p>
          <p className="text-sm text-text-secondary mb-6">
            Upload a video of your lift and AI will analyse your form, identify issues, and give you specific coaching cues.
          </p>
          <div className="flex gap-3 justify-center">
            <Button leftIcon={<Video className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
              Record Video
            </Button>
            <Button variant="secondary" leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute("capture"); fileRef.current.click(); } }}>
              Upload
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-4">Works best with full body visible in frame</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <video src={preview} controls className="w-full rounded-2xl max-h-56 object-cover" />

          {!result && (
            <div className="space-y-3">
              <Input
                label="What exercise is this?"
                placeholder="e.g. Barbell Squat, Deadlift, Bench Press..."
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
              />
              <Button className="w-full" loading={analyzing} leftIcon={<Zap className="h-4 w-4" />} onClick={handleAnalyze}>
                {analyzing ? "Analysing..." : "Analyse Form"}
              </Button>
            </div>
          )}

          {analyzing && (
            <Card className="text-center py-6">
              <div className="h-10 w-10 rounded-full border-2 border-accent-green border-t-transparent animate-spin mx-auto mb-3" />
              <p className="font-semibold text-text-primary">Analysing your form...</p>
              <p className="text-sm text-text-muted mt-1">This may take a few seconds</p>
            </Card>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className={`border-2 ${result.rating >= 7 ? "border-status-success/30" : "border-status-warning/30"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-text-primary">{result.exercise}</p>
                      <p className="text-sm text-text-muted">Form Analysis</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-4xl font-black font-display ${result.rating >= 7 ? "text-status-success" : "text-status-warning"}`}>
                        {result.rating}<span className="text-lg text-text-muted">/10</span>
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold text-text-primary mb-3">Form Feedback</h3>
                  <div className="space-y-2">
                    {result.feedback.map((fb, i) => (
                      <div key={i} className="flex gap-2">
                        {fb.type === "positive"
                          ? <CheckCircle2 className="h-4 w-4 text-status-success shrink-0 mt-0.5" />
                          : <AlertCircle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
                        }
                        <p className="text-sm text-text-secondary">{fb.point}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-accent-green/5 border-accent-green/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-accent-green" />
                    <p className="font-bold text-text-primary">Coaching Cues</p>
                  </div>
                  <div className="space-y-1.5">
                    {result.cues.map((cue, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent-green mt-2 shrink-0" />
                        <p className="text-sm text-text-secondary">{cue}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Button className="w-full" onClick={reset}>
                  Check Another Video
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
