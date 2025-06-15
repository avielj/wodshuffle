import React from "react";

export default function HistoryList({ history, onClear }) {
  if (!history || history.length === 0) return (
    <div className="text-center text-gray-400 py-8">No workout history yet.</div>
  );
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2 sm:gap-0">
        <h3 className="font-bold text-base sm:text-lg">Workout History</h3>
        <button className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white min-h-[36px] min-w-[36px]" onClick={onClear}>Clear History</button>
      </div>
      <div className="space-y-4">
        {history.map((wod, idx) => (
          <div key={idx} className="glassy p-2 sm:p-4 rounded-lg shadow fade-in border border-white/10">
            <div className="font-bold text-base mb-1">{wod.wod?.name || 'Custom WOD'}</div>
            <div className="text-xs text-gray-300 mb-1">{wod.wod?.type}</div>
            <div className="text-sm text-white/80 mb-1">{wod.wod?.description}</div>
            <ul className="list-disc pl-5 text-sm">
              {wod.wod?.exercises?.map((ex, i) => <li key={i}>{ex}</li>)}
            </ul>
            <div className="text-xs text-gray-400 mt-1">Generated: {wod.generatedAt ? new Date(wod.generatedAt).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
