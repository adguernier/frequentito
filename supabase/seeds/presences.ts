/**
 * Seed script to create presence records for all users
 * This will create presence data for today and optionally for multiple days
 * Use: npx tsx supabase/seeds/presences.ts
 */
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir, true, console, true);

const main = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ROLE_KEY!
  );

  console.log("🔄 Creating presences for all users...");

  // Get all users from auth
  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error("❌ Failed to fetch users:", usersError.message);
    process.exit(1);
  }

  if (!usersData.users || usersData.users.length === 0) {
    console.log("⚠️ No users found. Run the users seed first: npx tsx seed.ts");
    process.exit(0);
  }

  // Generate presences for today and the past 2 days to show variety
  const dates = [];
  for (let i = 0; i <= 2; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
  }

  console.log(
    `📅 Generating presences for ${dates.length} days: ${dates.join(", ")}`
  );

  let totalCreated = 0;

  // Create presences for each user and each date
  for (const user of usersData.users) {
    for (const day of dates) {
      // Check if presence already exists
      const { data: existingPresence } = await supabase
        .from("presences")
        .select("*")
        .eq("user_id", user.id)
        .eq("day", day)
        .maybeSingle();

      if (existingPresence) {
        console.log(
          `⚪ Presence already exists for ${user.email} on ${day} - skipping`
        );
        continue;
      }

      // Randomly determine presence pattern
      const patterns = [
        { am: true, pm: true, note: null }, // Full day
        { am: true, pm: false, note: "Morning only" }, // Morning only
        { am: false, pm: true, note: "Afternoon only" }, // Afternoon only
        { am: false, pm: false, note: null }, // Not coming
        { am: true, pm: true, note: "Remote work" }, // Full day with note
      ];

      const pattern = patterns[Math.floor(Math.random() * patterns.length)];

      try {
        const { error } = await supabase.from("presences").insert({
          user_id: user.id,
          day,
          am: pattern.am,
          pm: pattern.pm,
          note: pattern.note,
        });

        if (error) {
          console.error(
            `❌ Failed to create presence for ${user.email} on ${day}:`,
            error.message
          );
        } else {
          totalCreated++;
          const presenceDesc =
            pattern.am && pattern.pm
              ? "Full day"
              : pattern.am
                ? "Morning"
                : pattern.pm
                  ? "Afternoon"
                  : "Not coming";
          console.log(
            `✅ Created presence for ${user.email} on ${day}: ${presenceDesc}${pattern.note ? ` (${pattern.note})` : ""}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error creating presence for ${user.email} on ${day}:`,
          error
        );
      }
    }
  }

  console.log(
    `\n🎉 Successfully created ${totalCreated} presence records for ${usersData.users.length} users across ${dates.length} days!`
  );

  // Only exit if this script is run directly (not imported)
  if (require.main === module) {
    process.exit(0);
  }
};

export default main;
