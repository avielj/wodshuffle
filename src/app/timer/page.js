"use client";
import dynamic from "next/dynamic";

const WODTimer = dynamic(() => import("../../components/WODTimer.jsx"), { ssr: false });

export default function TimerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <WODTimer />
    </main>
  );
}
