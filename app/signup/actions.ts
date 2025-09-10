"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import z from "zod";

const SignupFormSchema = z
  .object({
    first_name: z
      .string()
      .min(1, { message: "First name is required." })
      .trim(),
    last_name: z.string().min(1, { message: "Last name is required." }).trim(),
    email: z.email({ message: "Please enter a valid email." }).trim(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type FormState =
  | {
      errors: string;
    }
  | {
      errors: {
        errors: string[];
        properties?: {
          first_name?: { errors: string[] };
          last_name?: { errors: string[] };
          email?: { errors: string[] };
          password?: { errors: string[] };
          confirmPassword?: { errors: string[] };
        };
      };
    }
  | {
      success: string;
    }
  | undefined;

export async function signup(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const data = {
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const validated = SignupFormSchema.safeParse(data);
  if (!validated.success) {
    return { errors: z.treeifyError(validated.error) } as FormState;
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        first_name: validated.data.first_name,
        last_name: validated.data.last_name,
      },
    },
  });
  if (error) {
    return { errors: error.message };
  }

  // Best-effort: if we have a session, also update the profiles row explicitly.
  if (signUpData?.user) {
    await supabase
      .from("profiles")
      .update({
        first_name: validated.data.first_name,
        last_name: validated.data.last_name,
      })
      .eq("id", signUpData.user.id);
  }

  return {
    success: "We have created your account. You can now log in.",
  };
}
