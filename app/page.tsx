"use client";

import dynamic from "next/dynamic";
import { PresenceForm } from "@/components/PresenceForm";
const PushManager = dynamic(() => import("@/components/PushManager"), {
  ssr: false,
});

export default function Home() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <PushManager />
      <PresenceForm />
    </section>
  );
}
