/**
 * Seed script to create user records
 * Use: npx tsx supabase/seeds/users.ts
 */
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { createSeedClient } from "@snaplet/seed";

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir, true, console, true);

const main = async () => {
  const seed = await createSeedClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ROLE_KEY!
  );

  console.log("🔄 Creating users...");

  const PASSWORD = "testuser";
  const emailDomain =
    process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "example.com";

  console.log(`👥 Generating 10 users with domain: ${emailDomain}`);

  let totalCreated = 0;
  let totalSkipped = 0;

  for (let i = 1; i <= 10; i++) {
    const email = `user${i}@${emailDomain}`;
    const password = PASSWORD;
    const first_name = `User${i}`;
    const last_name = "Demo";

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers.users?.some(
      (user) => user.email === email
    );

    if (userExists) {
      console.log(`⚪ User already exists: ${email} - skipping`);
      totalSkipped++;
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: first_name, first_name, last_name },
    });

    if (error) {
      console.error(`❌ Failed to create ${email}:`, error.message);
    } else {
      totalCreated++;
      console.log(
        `✅ Created user: ${email} (${first_name} ${last_name}) - id: ${data.user?.id}`
      );
    }
  }

  console.log(
    `\n🎉 Successfully created ${totalCreated} new users! (${totalSkipped} users already existed)`
  );

  // Make the first user an admin
  console.log("\n👑 Setting up admin user...");
  const adminEmail = `user1@${emailDomain}`;
  const { data: adminUser } = await supabase.auth.admin.listUsers();
  const admin = adminUser.users?.find((user) => user.email === adminEmail);

  if (admin) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ roles: ["admin"] })
      .eq("id", admin.id);

    if (updateError) {
      console.error(`❌ Failed to set admin role:`, updateError.message);
    } else {
      console.log(`✅ ${adminEmail} is now an admin`);
    }
  }

  // Only exit if this script is run directly (not imported)
  if (require.main === module) {
    process.exit(0);
  }
};

export default main;
