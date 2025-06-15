import React from "react";

const EQUIPMENT_OPTIONS = [
  { id: "bodyweight", label: "Bodyweight" },
  { id: "space to run", label: "Space to Run" },
  { id: "pullup bar", label: "Pullup Bar" },
  { id: "wall", label: "Wall" },
  { id: "jump rope", label: "Jump Rope" },
  { id: "box", label: "Box" },
  { id: "medicine ball", label: "Medicine Ball" },
  { id: "dumbbell", label: "Dumbbells" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "barbell", label: "Barbell + Weights" },
  { id: "bench", label: "Bench" },
  { id: "squat rack", label: "Squat Rack" },
  { id: "rings", label: "Gymnastic Rings" },
  { id: "rope to climb", label: "Rope to Climb" },
  { id: "rowing machine", label: "Rowing Machine" },
  { id: "swimming pool", label: "Swimming Pool" },
  { id: "dip bars", label: "Dip Bars" },
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
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 focus:outline-none min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 ${selectedEquipment.includes(eq.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-white border-white/20'}`}
        >
          {eq.label}
        </button>
      ))}
    </div>
  );
}
