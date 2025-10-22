/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createClient } from "@supabase/supabase-js";
import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ROLE_KEY!
  );

  const PASSWORD = "testuser";
  const emailDomain =
    process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "example.com";

  for (let i = 1; i <= 10; i++) {
    const email = `user${i}@${emailDomain}`;
    const password = PASSWORD;
    const first_name = `User${i}`;
    const last_name = "Demo";

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: first_name, first_name, last_name },
    });

    if (error) {
      console.error(`Failed to create ${email}:`, error.message);
    } else {
      console.log(`Created user: ${email} (id: ${data.user?.id})`);
    }
  }

  process.exit();
};
export default main;
