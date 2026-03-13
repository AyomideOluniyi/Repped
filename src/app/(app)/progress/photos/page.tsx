"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useUploadThing } from "@/lib/uploadthing";

type Photo = { id: string; url: string; type: string; takenAt: string };

export default function ProgressPhotosPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoType, setPhotoType] = useState<"FRONT" | "SIDE" | "BACK">("FRONT");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { startUpload } = useUploadThing("imageUploader");

  useEffect(() => {
    fetch("/api/progress/photos")
      .then((r) => r.json())
      .then(setPhotos)
      .catch(() => {});
  }, []);

  const handlePhotoAdd = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await startUpload([file]);
      if (!uploaded?.[0]) throw new Error("Upload failed");

      const res = await fetch("/api/progress/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploaded[0].ufsUrl, type: photoType }),
      });

      if (!res.ok) throw new Error("Save failed");
      const photo = await res.json();
      setPhotos((prev) => [photo, ...prev]);
      toast({ title: "Progress photo saved!", variant: "success" });
    } catch {
      toast({ title: "Failed to save photo", variant: "error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/progress/photos/${id}`, { method: "DELETE" }).catch(() => {
      toast({ title: "Failed to delete photo", variant: "error" });
    });
    setDeleting(null);
  };

  const filtered = photos.filter((p) => p.type === photoType);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex gap-2 p-1 bg-surface-elevated rounded-xl border border-border">
        {(["FRONT", "SIDE", "BACK"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setPhotoType(type)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              photoType === type ? "bg-background text-text-primary shadow-sm" : "text-text-muted"
            }`}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Hidden inputs: one for camera, one for gallery */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoAdd(f); }} />
      <input id="gallery-input" type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoAdd(f); }} />

      <div className="flex gap-2">
        <Button className="flex-1" leftIcon={<Camera className="h-4 w-4" />}
          onClick={() => fileRef.current?.click()} loading={uploading} disabled={uploading}>
          Camera
        </Button>
        <Button variant="secondary" className="flex-1" leftIcon={<Upload className="h-4 w-4" />}
          onClick={() => document.getElementById("gallery-input")?.click()} loading={uploading} disabled={uploading}>
          Upload
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Camera className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="font-bold text-text-primary mb-1">No {photoType.toLowerCase()} photos yet</p>
          <p className="text-sm text-text-secondary">Take weekly photos to track your physique progress</p>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {filtered.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="aspect-[3/4] rounded-xl overflow-hidden relative group"
              >
                <img src={photo.url} alt="Progress" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs font-semibold">
                    {new Date(photo.takenAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleting === photo.id}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
