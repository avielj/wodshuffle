import React from "react";

export default function StrengthSection({ strength }) {
  if (!strength || strength.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2">Strength</h3>
      <ul className="list-disc ml-6">
        {strength.map((ex) => (
          <li key={ex.exerciseId}>
            {ex.name}: {ex.sets} sets, {ex.reps} <span className="text-gray-500">(Rest: {ex.rest})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
