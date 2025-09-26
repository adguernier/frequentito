"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { updateProfile, type ProfileActionState } from "@/app/actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProfileForm({
  first_name,
  last_name,
  avatar_url,
}: {
  first_name: string;
  last_name: string;
  avatar_url?: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProfileActionState,
    FormData
  >(updateProfile, undefined);
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(avatar_url);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [avatarWidth, setAvatarWidth] = useState<number | null>(null);
  const [avatarHeight, setAvatarHeight] = useState<number | null>(null);
  const [avatarColor, setAvatarColor] = useState<string | null>(null);
  const [removePending, setRemovePending] = useState(false);
  const lastUploadRef = useRef<number>(0);
  const previousFilePathRef = useRef<string | null>(null);
  const previousAvatarPublicUrlRef = useRef<string | null>(avatar_url || null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionUserId(user?.id ?? null);
    });
  }, [supabase]);

  return (
    <section className="h-full w-full flex items-center justify-center px-4 py-8">
      <form
        key={`${first_name}-${last_name}`}
        action={formAction}
        className="w-full max-w-md flex flex-col gap-4"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">Your profile</h1>
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full self-center object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-default-200 self-center" />
        )}
        <Input name="avatar_url" type="hidden" value={avatar ?? ""} readOnly />
        <Input
          name="avatar_width"
          type="hidden"
          value={avatarWidth != null ? String(avatarWidth) : ""}
          readOnly
        />
        <Input
          name="avatar_height"
          type="hidden"
          value={avatarHeight != null ? String(avatarHeight) : ""}
          readOnly
        />
        <Input
          name="avatar_color"
          type="hidden"
          value={avatarColor ?? ""}
          readOnly
        />
        <Input
          name="avatar_remove"
          type="hidden"
          value={removePending ? "true" : "false"}
          readOnly
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            if (!file) return;
            setUploadError(null);
            if (!sessionUserId) {
              setUploadError("Not authenticated – please log in again.");
              return;
            }
            if (Date.now() - lastUploadRef.current < 5000) {
              setUploadError(
                "Please wait a few seconds before uploading again."
              );
              return;
            }
            try {
              setUploading(true);
              const MAX_BYTES = 2 * 1024 * 1024; // 2MB
              if (file.size > MAX_BYTES)
                throw new Error("File too large (max 2MB)");
              if (!file.type.startsWith("image/"))
                throw new Error("File must be an image");

              // Load image
              const img = await new Promise<HTMLImageElement>(
                (resolve, reject) => {
                  const url = URL.createObjectURL(file);
                  const image = new Image();
                  image.onload = () => resolve(image);
                  image.onerror = reject;
                  image.src = url;
                }
              );
              const size = Math.min(
                512,
                Math.max(64, Math.min(img.width, img.height))
              );
              const canvas = document.createElement("canvas");
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Canvas not supported");
              const sx =
                img.width > img.height ? (img.width - img.height) / 2 : 0;
              const sy =
                img.height > img.width ? (img.height - img.width) / 2 : 0;
              const sSide = Math.min(img.width, img.height);
              ctx.drawImage(img, sx, sy, sSide, sSide, 0, 0, size, size);
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
              const blob: Blob = await new Promise((resolve) =>
                canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.85)
              );
              const filePath = `${sessionUserId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
              const { data, error } = await supabase.storage
                .from("avatars")
                .upload(filePath, blob, {
                  upsert: false,
                  contentType: "image/jpeg",
                });
              if (error) throw error;
              const { data: publicUrl } = supabase.storage
                .from("avatars")
                .getPublicUrl(data.path);
              // delete previous file (best effort)
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
              previousAvatarPublicUrlRef.current = publicUrl.publicUrl;
              setAvatar(publicUrl.publicUrl);
              setRemovePending(false);
              lastUploadRef.current = Date.now();
            } catch (error: any) {
              setUploadError(
                error?.message || "Error uploading avatar – please retry."
              );
            } finally {
              setUploading(false);
            }
          }}
        />
        <Button
          type="button"
          onPress={() => fileRef.current?.click()}
          isDisabled={uploading}
          variant="flat"
        >
          {uploading ? "Uploading…" : "Upload avatar"}
        </Button>
        {avatar && !removePending && !uploading && (
          <Button
            type="button"
            color="danger"
            variant="light"
            onPress={() => {
              setAvatar(undefined);
              setAvatarWidth(null);
              setAvatarHeight(null);
              setAvatarColor(null);
              setRemovePending(true);
            }}
          >
            Remove avatar
          </Button>
        )}
        <Input name="first_name" label="First name" defaultValue={first_name} />
        <Input name="last_name" label="Last name" defaultValue={last_name} />
        {uploadError && (
          <p className="text-xs text-danger-500" role="alert">
            {uploadError}
          </p>
        )}
        {state && "error" in state && state.error && (
          <p className="text-sm text-danger-500" role="alert">
            {state.error}
          </p>
        )}
        {state && "ok" in state && state.ok && (
          <p className="text-sm text-success-500">Saved!</p>
        )}
        <Button type="submit" color="primary" isDisabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </form>
    </section>
  );
}
