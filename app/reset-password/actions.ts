"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAllowedEmailDomain } from "@/utils/emailDomainConfig";
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

  // Validate email domain
  const allowedDomain = await getAllowedEmailDomain();
  const emailDomain = validatedFields.data.email.split("@")[1];

  if (emailDomain !== allowedDomain) {
    return {
      errors: {
        errors: [],
        properties: {
          email: {
            errors: [`Email must be from the ${allowedDomain} domain.`],
          },
        },
      },
    };
  }

  // Check if user exists with this email using admin client
  const adminClient = createAdminClient();
  const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error checking user existence:", listError);
    return {
      errors: "Unable to process your request. Please try again later.",
    };
  }

  const userExists = users.users.some(
    (user) => user.email?.toLowerCase() === validatedFields.data.email.toLowerCase()
  );

  if (!userExists) {
    return {
      errors: {
        errors: [],
        properties: {
          email: {
            errors: ["No account found with this email address."],
          },
        },
      },
    };
  }

  // Get the origin for the redirect URL
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
