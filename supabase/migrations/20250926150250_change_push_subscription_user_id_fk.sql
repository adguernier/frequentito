alter table "public"."push_subscriptions" add constraint "push_subscriptions_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."push_subscriptions" validate constraint "push_subscriptions_user_id_fkey1";


