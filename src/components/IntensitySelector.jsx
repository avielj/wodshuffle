import React from "react";

const INTENSITIES = [
  { id: "scaled", label: "Scaled" },
  { id: "rx", label: "Rx" },
  { id: "athlete", label: "Athlete" },
];

export default function IntensitySelector({ intensity, onChange }) {
  return (
    <div>
      <label className="block font-semibold mb-2">Select intensity:</label>
      <div className="flex gap-4">
        {INTENSITIES.map((i) => (
          <label key={i.id} className="flex items-center gap-1">
            <input
              type="radio"
              name="intensity"
              value={i.id}
              checked={intensity === i.id}
              onChange={() => onChange(i.id)}
            />
            {i.label}
          </label>
        ))}
      </div>
    </div>
  );
}
