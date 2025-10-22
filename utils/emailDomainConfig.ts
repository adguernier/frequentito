import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import "@/envConfig";

/**
 * Updates the allowed email domain in the database configuration
 * This ensures the database validation uses the same domain as the application
 */
export async function updateEmailDomainConfig() {
  const supabase = await createClient();
  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN;

  if (!allowedDomain) {
    throw new Error(
      "NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN environment variable is required"
    );
  }

  const { error } = await supabase.from("app_config").upsert({
    key: "allowed_email_domain",
    value: allowedDomain,
    description: "Email domain required for user registration",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to update email domain configuration:", error);
    throw error;
  }

  console.log(`Email domain configuration updated to: @${allowedDomain}`);
}

/**
 * Updates the allowed email domain in the database configuration using admin privileges
 * Used for seed scripts and other contexts where cookies are not available
 */
export async function updateEmailDomainConfigAdmin() {
  const supabase = createAdminClient();
  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN;

  if (!allowedDomain) {
    throw new Error(
      "NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN environment variable is required"
    );
  }

  const { error } = await supabase.from("app_config").upsert({
    key: "allowed_email_domain",
    value: allowedDomain,
    description: "Email domain required for user registration",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to update email domain configuration:", error);
    throw error;
  }

  console.log(`Email domain configuration updated to: @${allowedDomain}`);
}

/**
 * Gets the current allowed email domain from the database
 */
export async function getAllowedEmailDomain(): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "allowed_email_domain")
    .single();

  if (error || !data) {
    console.warn(
      "Failed to get email domain from database, using environment default"
    );
    const fallbackDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN;
    if (!fallbackDomain) {
      throw new Error(
        "NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN environment variable is required"
      );
    }
    return fallbackDomain;
  }

  return data.value;
}
