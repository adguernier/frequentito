import { Suspense } from "react";
import { PresenceForm } from "@/components/PresenceForm";
import PresenceList from "@/components/PresenceList";
import PushManager from "@/components/PushManager";

export default async function Home() {
  return (
    <section className="min-h-[70vh] w-full max-w-xl mx-auto flex flex-col gap-6 px-4 py-8">
      <PushManager />
      <PresenceForm />
      <div>
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
