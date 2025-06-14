import React from "react";
import WarmupSection from "./WarmupSection";
import StrengthSection from "./StrengthSection";
import MetconSection from "./MetconSection";

export default function WorkoutDisplay({ workout, onRegenerate }) {
  if (!workout) return null;
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-2xl font-bold mb-4">Your WOD</h2>
      <WarmupSection warmup={workout.warmup} />
      <StrengthSection strength={workout.strength} />
      <MetconSection metcon={workout.metcon} />
      <button
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        onClick={onRegenerate}
      >
        Regenerate WOD
      </button>
    </div>
  );
}
