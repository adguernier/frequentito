"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import z from "zod";

const SignupFormSchema = z
  .object({
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
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const validated = SignupFormSchema.safeParse(data);
  if (!validated.success) {
    return { errors: z.treeifyError(validated.error) } as FormState;
  }

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
  });
  console.log({ error });
  if (error) {
    return { errors: error.message };
  }

  return {
    success: "We have created your account. You can now log in.",
  };
}
