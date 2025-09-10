"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { updateProfile, type ProfileActionState } from "@/app/actions";
import { useRouter } from "next/navigation";
// import { createClient } from "@supabase/supabase-js";

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
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // );
  // const [uploading, setUploading] = useState(false);
  // const [avatar, setAvatar] = useState<string | undefined>(avatar_url);
  // const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <section className="h-full w-full flex items-center justify-center px-4 py-8">
      <form
        key={`${first_name}-${last_name}`}
        action={formAction}
        className="w-full max-w-md flex flex-col gap-4"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">Your profile</h1>
        {/* {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full self-center object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-default-200 self-center" />
        )} */}
        {/* <Input name="avatar_url" type="hidden" defaultValue={avatar ?? ""} /> */}
        {/* <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            if (!file) return;
            try {
              setUploading(true);
              const ext = file.name.split(".").pop();
              const filePath = `avatars/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
              const { data, error } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: false });
              if (error) throw error;
              const { data: publicUrl } = supabase.storage
                .from("avatars")
                .getPublicUrl(data.path);
              setAvatar(publicUrl.publicUrl);
            } catch (_) {
              // ignore upload errors for now
            } finally {
              setUploading(false);
            }
          }}
        /> */}
        {/* <Button
          type="button"
          onPress={() => fileRef.current?.click()}
          isDisabled={uploading}
          variant="flat"
        >
          {uploading ? "Uploading…" : "Upload avatar"}
        </Button> */}
        <Input name="first_name" label="First name" defaultValue={first_name} />
        <Input name="last_name" label="Last name" defaultValue={last_name} />
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
