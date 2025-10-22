"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import z from "zod";

const ResetPasswordFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
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
        };
      };
    }
  | {
      success: string;
    }
  | undefined;

export async function requestPasswordReset(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
  };

  const validatedFields = ResetPasswordFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: z.treeifyError(validatedFields.error),
    };
  }

  // Get the origin for the redirect URL
  const hdrs = await headers();  
  const origin = hdrs.get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    validatedFields.data.email,
    {
      redirectTo: `${origin}/auth/set-password`,
    }
  );

  if (error) {
    return {
      errors: error.message,
    };
  }

  return {
    success:
      "Check your email for a password reset link. If you don't see it, check your spam folder.",
  };
}
