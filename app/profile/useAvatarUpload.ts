"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface UseAvatarUploadResult {
  avatar: string | undefined;
  avatarWidth: number | null;
  avatarHeight: number | null;
  avatarColor: string | null;
  removePending: boolean;
  uploading: boolean;
  uploadError: string | null;
  fileRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  openFilePicker: () => void;
  removeAvatar: () => void;
}

/**
 * Encapsulates avatar selection, client‑side processing (square crop, resize, JPEG encode),
 * dominant color extraction, upload to Supabase storage with per‑user path constraint,
 * metadata tracking (width/height/color), simple rate limiting and best‑effort cleanup
 * of previously uploaded files.
 */
export function useAvatarUpload(
  initialAvatarUrl?: string
): UseAvatarUploadResult {
  const supabase = createClient();
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(initialAvatarUrl);
  const [avatarWidth, setAvatarWidth] = useState<number | null>(null);
  const [avatarHeight, setAvatarHeight] = useState<number | null>(null);
  const [avatarColor, setAvatarColor] = useState<string | null>(null);
  const [removePending, setRemovePending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const lastUploadRef = useRef<number>(0);
  const previousFilePathRef = useRef<string | null>(null);

  // Fetch current user id once.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionUserId(user?.id ?? null);
    });
  }, [supabase]);

  const openFilePicker = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const removeAvatar = useCallback(() => {
    setAvatar(undefined);
    setAvatarWidth(null);
    setAvatarHeight(null);
    setAvatarColor(null);
    setRemovePending(true);
  }, []);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0];
      if (!file) return;
      setUploadError(null);
      if (!sessionUserId) {
        setUploadError("Not authenticated – please log in again.");
        return;
      }
      if (Date.now() - lastUploadRef.current < 5000) {
        setUploadError("Please wait a few seconds before uploading again.");
        return;
      }
      try {
        setUploading(true);
        const MAX_BYTES = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_BYTES) throw new Error("File too large (max 2MB)");
        if (!file.type.startsWith("image/"))
          throw new Error("File must be an image");

        // Load image
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const url = URL.createObjectURL(file);
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = url;
        });

        // Determine square size (<=512) using the smallest dimension, clamp >=64
        const size = Math.min(
          512,
          Math.max(64, Math.min(img.width, img.height))
        );
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        const sx = img.width > img.height ? (img.width - img.height) / 2 : 0;
        const sy = img.height > img.width ? (img.height - img.width) / 2 : 0;
        const sSide = Math.min(img.width, img.height);
        ctx.drawImage(img, sx, sy, sSide, sSide, 0, 0, size, size);

        // Dominant color (very naive average sample every 64th pixel)
        const imageData = ctx.getImageData(0, 0, size, size);
        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        const dataArr = imageData.data;
        for (let i = 0; i < dataArr.length; i += 4 * 64) {
          r += dataArr[i];
          g += dataArr[i + 1];
          b += dataArr[i + 2];
          count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        setAvatarColor(hex);
        setAvatarWidth(size);
        setAvatarHeight(size);

        // Encode to JPEG (85% quality)
        const blob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.85)
        );

        const filePath = `${sessionUserId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, { upsert: false, contentType: "image/jpeg" });
        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from("avatars")
          .getPublicUrl(data.path);

        // Delete previous file (best effort)
        if (
          previousFilePathRef.current &&
          previousFilePathRef.current !== data.path
        ) {
          supabase.storage
            .from("avatars")
            .remove([previousFilePathRef.current])
            .catch(() => {});
        }
        previousFilePathRef.current = data.path;
        setAvatar(publicUrl.publicUrl);
        setRemovePending(false);
        lastUploadRef.current = Date.now();
      } catch (err: any) {
        setUploadError(
          err?.message || "Error uploading avatar – please retry."
        );
      } finally {
        setUploading(false);
      }
    },
    [sessionUserId, supabase]
  );

  return {
    avatar,
    avatarWidth,
    avatarHeight,
    avatarColor,
    removePending,
    uploading,
    uploadError,
    fileRef,
    onFileChange,
    openFilePicker,
    removeAvatar,
  };
}
