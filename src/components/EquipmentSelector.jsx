import React from "react";

const EQUIPMENT_OPTIONS = [
  { id: "bodyweight", label: "Bodyweight" },
  { id: "barbell", label: "Barbell" },
  { id: "dumbbell", label: "Dumbbell" },
  { id: "kettlebell", label: "Kettlebell" },
];

export default function EquipmentSelector({ selectedEquipment, onChange }) {
  const handleToggle = (id) => {
    if (selectedEquipment.includes(id)) {
      onChange(selectedEquipment.filter((e) => e !== id));
    } else {
      onChange([...selectedEquipment, id]);
    }
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2 justify-center">
      {EQUIPMENT_OPTIONS.map((eq) => (
        <button
          key={eq.id}
          type="button"
          onClick={() => handleToggle(eq.id)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 focus:outline-none ${selectedEquipment.includes(eq.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-white border-white/20'}`}
        >
          {eq.label}
        </button>
      ))}
    </div>
  );
}
