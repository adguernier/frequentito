import users from "./supabase/seeds/users";
import presences from "./supabase/seeds/presences";
import { updateEmailDomainConfigAdmin } from "./utils/emailDomainConfig";

const main = async () => {
  try {
    console.log("🏁 Starting database seeding...");

    // Sync email domain configuration with environment variable
    console.log("⚙️  Syncing email domain configuration...");
    await updateEmailDomainConfigAdmin();

    // Seed users first
    console.log("\n👥 Seeding users...");
    await users().catch((error) => {
      console.error("❌ Seed script failed:", error);
      if (require.main === module) {
        process.exit(1);
      }
    });

    // Then seed presences
    console.log("\n📅 Seeding presences...");
    await presences().catch((error) => {
      console.error("❌ Seed script failed:", error);
      if (require.main === module) {
        process.exit(1);
      }
    });

    console.log("\n🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    process.exit(1);
  }
};

// Handle errors gracefully
main().catch((error) => {
  console.error("❌ Unexpected error during seeding:", error);
  process.exit(1);
});
