import { Suspense } from "react";
import { PresenceForm } from "@/components/PresenceForm";
import PresenceList from "@/components/PresenceList";
import PushManager from "@/components/PushManager";

export default async function Home() {
  return (
    <section className="min-h-[80vh] w-full flex flex-col items-center justify-center gap-8 px-4 py-8">
      <PushManager />
      <PresenceForm />
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
