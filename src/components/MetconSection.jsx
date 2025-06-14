import React from "react";

export default function MetconSection({ metcon }) {
  if (!metcon) return null;
  const { custom, benchmark } = metcon;
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2">Metcon</h3>
      {custom && (
        <div className="mb-2">
          <div className="font-bold">{custom.name}</div>
          <ul className="list-disc ml-6">
            {custom.structure.map((s, i) => (
              <li key={i}>{s.exercise}: {s.reps} reps</li>
            ))}
          </ul>
        </div>
      )}
      {benchmark && (
        <div className="mt-2 p-2 border rounded bg-gray-50">
          <div className="font-bold">Benchmark: {benchmark.name}</div>
          <div className="text-gray-700">{benchmark.description}</div>
        </div>
      )}
    </div>
  );
}
