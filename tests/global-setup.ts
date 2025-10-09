import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for e2e tests...");

  // Check if we're in CI or local environment
  const isCI = !!process.env.CI;

  if (isCI) {
    console.log(
      "📦 CI environment detected - Supabase will be set up by CI workflow"
    );
    // In CI, the workflow should handle Supabase setup
    // We just need to wait for the database to be ready and seed it
    await startSupabase();
    await seedDatabase();
  } else {
    console.log("💻 Local environment detected - checking Supabase status");
    // In local environment, assume Supabase is started by Makefile
    // Just seed the database
    await startSupabase();
    await dbReset();
    await seedDatabase();
  }

  console.log("✅ Global setup completed");
}

async function startSupabase() {
  console.log("🚀 Starting Supabase local development...");
  const { execSync } = await import("child_process");
  execSync("npx supabase start", { stdio: "inherit" });
}

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Import and run the seed script
  try {
    // We'll use the same seeding logic as the seed.ts file
    const { execSync } = await import("child_process");
    execSync("npx tsx seed.ts", { stdio: "inherit" });
    console.log("✅ Database seeded successfully");
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
    throw error;
  }
}

async function dbReset() {
  console.log("🔄 Resetting database...");
  try {
    const { execSync } = await import("child_process");
    execSync("npx supabase db reset", { stdio: "inherit" });
    console.log("✅ Database reset successfully");
  } catch (error) {
    console.error("❌ Failed to reset database:", error);
    throw error;
  }
}

export default globalSetup;
