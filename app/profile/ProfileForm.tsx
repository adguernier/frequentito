"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { updateProfile, type ProfileActionState } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useAvatarUpload } from "./useAvatarUpload";
import { logout } from "@/app/actions";

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
  const {
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
  } = useAvatarUpload(avatar_url);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  // User id retrieval & upload handling moved into useAvatarUpload hook.

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 gap-4">
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
          onChange={onFileChange}
        />
        <Button
          type="button"
          onPress={openFilePicker}
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
            onPress={removeAvatar}
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
      <form action={logout} className="w-full max-w-md">
        <Button type="submit" color="danger" variant="flat" className="w-full">
          Log Out
        </Button>
      </form>
    </section>
  );
}
