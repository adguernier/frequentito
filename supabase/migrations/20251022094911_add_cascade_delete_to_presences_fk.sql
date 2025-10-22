-- Add cascade delete to presences foreign key constraint
-- This allows automatic deletion of presences when a profile is deleted

-- Drop the existing foreign key constraint
alter table "public"."presences" drop constraint "presences_user_id_fkey";

-- Add the foreign key constraint with ON DELETE CASCADE
alter table "public"."presences" 
  add constraint "presences_user_id_fkey" 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE 
  not valid;

-- Validate the constraint
alter table "public"."presences" validate constraint "presences_user_id_fkey";
