"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Film, X, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUploadThing } from "@/lib/uploadthing";

const MUSCLE_GROUPS = ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "ABS", "FULL_BODY", "CARDIO"];

// Compress threshold: only compress if over 40MB
const COMPRESS_THRESHOLD = 40 * 1024 * 1024;

async function compressVideo(
  file: File,
  onProgress: (p: number) => void
): Promise<File> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();
  ffmpeg.on("progress", ({ progress }) => onProgress(Math.round(progress * 100)));

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  await ffmpeg.writeFile("input.mp4", await fetchFile(file));
  // Scale to max 720p, target ~1.5Mbps video + 128k audio
  await ffmpeg.exec([
    "-i", "input.mp4",
    "-vf", "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease",
    "-c:v", "libx264",
    "-crf", "28",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-b:a", "96k",
    "-movflags", "+faststart",
    "output.mp4",
  ]);

  const data = await ffmpeg.readFile("output.mp4");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = new Blob([data as any], { type: "video/mp4" });
  return new File([blob], file.name.replace(/\.[^.]+$/, ".mp4"), { type: "video/mp4" });
}

export default function VideoUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { startUpload } = useUploadThing("videoUploader", {
    onUploadProgress: (p) => setProgress(p),
  });

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      toast({ title: "Please select a video file", variant: "error" });
      return;
    }
    if (f.size > 512 * 1024 * 1024) {
      toast({ title: "File too large (max 512MB)", variant: "error" });
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  };

  const toggleMuscle = (m: string) =>
    setSelectedMuscles((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const handleSubmit = async () => {
    if (!file || !title.trim()) {
      toast({ title: "Title and video file are required", variant: "error" });
      return;
    }
    setUploading(true);

    try {
      let uploadFile = file;

      // Auto-compress if over threshold
      if (file.size > COMPRESS_THRESHOLD) {
        setCompressing(true);
        setProgress(0);
        try {
          uploadFile = await compressVideo(file, setProgress);
        } catch {
          // Compression failed — upload original
          toast({ title: "Compression skipped, uploading original", variant: "error" });
          uploadFile = file;
        }
        setCompressing(false);
        setProgress(0);
      }

      const uploaded = await startUpload([uploadFile]);
      if (!uploaded?.[0]) throw new Error("Upload failed");
      const videoUrl = uploaded[0].ufsUrl;
      setProgress(100);

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          url: videoUrl,
          muscleGroups: selectedMuscles,
          difficulty,
          isPublic,
        }),
      });

      if (!res.ok) throw new Error("Upload failed");
      toast({ title: "Video uploaded! 🎥", variant: "success" });
      router.push("/videos");
    } catch {
      toast({ title: "Upload failed", variant: "error" });
      setProgress(0);
    } finally {
      setUploading(false);
      setCompressing(false);
    }
  };

  const needsCompression = file && file.size > COMPRESS_THRESHOLD;
  const statusLabel = compressing ? "Compressing..." : "Uploading...";

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "video/*"; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f); }; input.click(); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          file ? "border-accent-green bg-accent-green/5" : "border-border hover:border-accent-green/40 hover:bg-accent-green/5"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <Film className="h-8 w-8 text-accent-green" />
            <div className="text-left">
              <p className="font-semibold text-text-primary">{file.name}</p>
              <p className={`text-sm font-medium ${needsCompression ? "text-amber-400" : "text-text-muted"}`}>
                {(file.size / 1024 / 1024).toFixed(1)} MB
                {needsCompression && " · Will be compressed automatically"}
              </p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0); }}>
              <X className="h-5 w-5 text-text-muted hover:text-status-error transition-colors" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="font-semibold text-text-primary">Tap to select video</p>
            <p className="text-sm text-text-muted mt-1">MP4 or MOV · Max 512MB</p>
            <p className="text-xs text-text-muted mt-1 flex items-center justify-center gap-1">
              <Zap className="h-3 w-3" /> Files over 40MB auto-compressed before upload
            </p>
          </>
        )}
      </div>

      {/* Progress */}
      {uploading && (
        <div>
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span className="flex items-center gap-1">
              {compressing && <Zap className="h-3 w-3 text-amber-400" />}
              {statusLabel}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${compressing ? "bg-amber-400" : "bg-accent-green"}`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Form fields */}
      <Input label="Title" placeholder="Bench Press Form Check" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input label="Description (optional)" placeholder="Form cues, notes..." value={description} onChange={(e) => setDescription(e.target.value)} />

      {/* Muscle groups */}
      <div>
        <label className="text-sm text-text-secondary mb-2 block">Muscle Groups</label>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((m) => (
            <button
              key={m}
              onClick={() => toggleMuscle(m)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                selectedMuscles.includes(m)
                  ? "border-accent-green bg-accent-green/10 text-accent-green"
                  : "border-border bg-surface-elevated text-text-secondary hover:border-border-strong"
              }`}
            >
              {selectedMuscles.includes(m) && <Check className="h-2.5 w-2.5 inline mr-1" />}
              {m.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-text-secondary mb-1.5 block">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-text-secondary mb-1.5 block">Visibility</label>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`w-full h-11 rounded-xl border text-sm font-medium transition-all ${
              isPublic ? "border-accent-green bg-accent-green/10 text-accent-green" : "border-border bg-surface-elevated text-text-secondary"
            }`}
          >
            {isPublic ? "🌎 Public" : "🔒 Private"}
          </button>
        </div>
      </div>

      <Button size="lg" className="w-full" loading={uploading} leftIcon={<Upload className="h-4 w-4" />} onClick={handleSubmit}>
        {needsCompression ? "Compress & Upload" : "Upload Video"}
      </Button>
    </div>
  );
}
