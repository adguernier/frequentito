alter table "public"."presences" drop constraint "presences_user_id_fkey";

alter table "public"."presences" add constraint "presences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."presences" validate constraint "presences_user_id_fkey";


