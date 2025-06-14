import React from "react";

export default function WarmupSection({ warmup }) {
  if (!warmup || warmup.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2">Warmup</h3>
      <ul className="list-disc ml-6">
        {warmup.map((ex) => (
          <li key={ex.exerciseId}>
            {ex.name} <span className="text-gray-500">({ex.duration})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
