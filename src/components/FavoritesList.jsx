import React from "react";

export default function FavoritesList({ favorites, onRemove, onRegenerate }) {
  if (!favorites || favorites.length === 0) return (
    <div className="text-center text-gray-400 py-8">No favorite workouts yet.</div>
  );
  return (
    <div className="space-y-4">
      {favorites.map((wod, idx) => (
        <div key={idx} className="glassy p-4 rounded-lg shadow fade-in border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-lg">{wod.wod?.name || 'Custom WOD'}</h4>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                onClick={() => onRemove(idx)}
                title="Remove from favorites"
              >🗑 Remove</button>
              <button
                className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onRegenerate(wod)}
                title="Re-generate this workout"
              >🔄 Re-generate</button>
            </div>
          </div>
          <div className="text-sm text-white/80 mb-1">{wod.wod?.description}</div>
          <div className="text-xs text-gray-300 mb-1">Type: {wod.wod?.type}</div>
          <ul className="list-disc pl-5 text-sm">
            {wod.wod?.exercises?.map((ex, i) => <li key={i}>{ex}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
