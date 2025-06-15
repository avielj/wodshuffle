import React, { useEffect, useState } from "react";
import generateWorkout from "../utils/generateWorkout";
import html2canvas from "html2canvas";

export default function MetconOnlyGenerator({ intensity, onGenerate }) {
  const [metcon, setMetcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenKey, setRegenKey] = useState(0);

  useEffect(() => { setRegenKey((k) => k + 1); }, [intensity]);
  const handleRegenerate = () => setRegenKey((k) => k + 1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    const custom = { metconOnly: true };
    generateWorkout([], intensity, [], custom)
      .then((wod) => {
        if (isMounted) {
          setMetcon(wod?.wod);
          setLoading(false);
          if (onGenerate && wod?.wod) onGenerate({ wod: wod.wod });
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load metcon data.");
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [intensity, regenKey]);

  // Remove share, favorite, customize, and demo links from export/share card
  // Only show the workout content
  if (loading) return <div className="mt-8 text-center text-lg text-blue-400">Generating MetCon...</div>;
  if (error) return <div className="mt-8 text-center text-red-500">{error}</div>;
  if (!metcon) return null;

  return (
    <div id="metcon-card" className="mt-8 w-full max-w-2xl glassy text-white p-2 sm:p-6 rounded-lg shadow-lg fade-in border border-white/10 relative">
      <div className="mb-2 text-blue-300 font-semibold text-lg">{metcon.type}</div>
      <div className="mb-2 text-white/80 italic">{metcon.description}</div>
      <ul className="list-disc pl-5">
        {metcon.exercises.map((ex, idx) => (
          <li key={idx} className="mb-2 flex items-center gap-2 fade-in">{ex}</li>
        ))}
      </ul>
      <button
        onClick={handleRegenerate}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 min-h-[44px]"
      >Regenerate MetCon</button>
    </div>
  );
}
