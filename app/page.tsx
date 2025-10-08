import { Suspense } from "react";
import { PresenceForm } from "@/app/PresenceForm";
import PresenceList from "@/app/PresenceList";
import PushManager from "@/app/PushManager";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = new Date().toISOString().slice(0, 10);
  let initialAm = false;
  let initialPm = false;
  let lockedInitially = false;
  if (user) {
    const { data } = await supabase
      .from("presences")
      .select("am, pm")
      .eq("user_id", user.id)
      .eq("day", today)
      .maybeSingle();
    if (data) {
      initialAm = !!data.am;
      initialPm = !!data.pm;
      lockedInitially = true;
    }
  }
  console.log({ initialAm, initialPm, lockedInitially });
  return (
    <section className="min-h-[80vh] w-full flex flex-col items-center justify-center gap-8 px-4 py-8">
      <PushManager />
      <PresenceForm
        initialAm={initialAm}
        initialPm={initialPm}
        lockedInitially={lockedInitially}
      />
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-sm font-medium mb-2 text-foreground-500">
          Today’s teammates
        </h2>
        <Suspense
          fallback={<p className="text-sm text-foreground-500">Loading…</p>}
        >
          {/* Server component renders on the server; Suspense allows streaming */}
          <PresenceList />
        </Suspense>
      </div>
    </section>
  );
}
