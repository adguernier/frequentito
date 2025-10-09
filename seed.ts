import users from "./supabase/seeds/users";
import { updateEmailDomainConfigAdmin } from "./utils/emailDomainConfig";

const main = async () => {
  // Sync email domain configuration with environment variable
  await updateEmailDomainConfigAdmin();

  // Seed users
  users();
};

main();
