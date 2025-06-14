import React from "react";

const BODY_PARTS = [
  { id: "upper_body_push", name: "Upper Push", emoji: "💪", muscles: ["Chest", "Shoulders", "Triceps"] },
  { id: "upper_body_pull", name: "Upper Pull", emoji: "🏋️", muscles: ["Back", "Biceps", "Lats"] },
  { id: "lower_body", name: "Lower Body", emoji: "🦵", muscles: ["Quads", "Glutes", "Hamstrings"] },
  { id: "core", name: "Core", emoji: "⚡", muscles: ["Abs", "Obliques", "Lower Back"] },
  { id: "full_body", name: "Full Body", emoji: "🔥", muscles: ["All Muscle Groups"] },
];

export default function BodyPartSelector({ selectedBodyParts, onChange }) {
  const handleChange = (id) => {
    let updated;
    if (selectedBodyParts.includes(id)) {
      updated = selectedBodyParts.filter((bp) => bp !== id);
    } else if (selectedBodyParts.length < 3) {
      updated = [...selectedBodyParts, id];
    } else {
      updated = selectedBodyParts;
    }
    onChange(updated);
  };

  return (
    <div>
      <label className="block font-semibold mb-2">Select up to 3 muscle groups to focus on</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BODY_PARTS.map((bp) => (
          <div
            key={bp.id}
            onClick={() => handleChange(bp.id)}
            className={`flex flex-col items-start gap-2 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer transition-all duration-150 shadow-sm hover:border-blue-400 select-none ${selectedBodyParts.includes(bp.id) ? 'ring-2 ring-blue-400' : ''} ${selectedBodyParts.length >= 3 && !selectedBodyParts.includes(bp.id) ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-3xl select-none mr-2">{bp.emoji}</span>
              <span className="font-bold text-white text-lg">{bp.name}</span>
            </div>
            <div className="ml-8">
              {bp.muscles.map((m, i) => (
                <div key={i} className="text-xs text-white/70 leading-tight">{m}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
