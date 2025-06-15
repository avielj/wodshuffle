import React, { useEffect, useState } from "react";
import generateWorkout from "../utils/generateWorkout";
import ExportButton from "./ExportButton";

export default function MetconOnlyGenerator({ intensity, equipment = [], onFavorite, onGenerate }) {
  const [metcon, setMetcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenKey, setRegenKey] = useState(0);

  useEffect(() => { setRegenKey((k) => k + 1); }, [intensity, equipment]);
  const handleRegenerate = () => setRegenKey((k) => k + 1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    generateWorkout([], intensity, equipment, { metconOnly: true })
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
  }, [intensity, equipment, regenKey]);

  if (loading) return <div className="mt-8 text-center text-lg text-blue-400">Generating MetCon...</div>;
  if (error) return <div className="mt-8 text-center text-red-500">{error}</div>;
  if (!metcon) return null;

  const handleCopy = () => {
    const text = `MetCon: ${metcon.name}\nType: ${metcon.type}\n${metcon.description}\nExercises:\n${metcon.exercises.map((e, i) => `${i+1}. ${e}`).join("\n")}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert("MetCon copied to clipboard!");
    }
  };

  return (
    <div id="metcon-card" className="mt-8 w-full max-w-2xl glassy text-white p-6 rounded-lg shadow-lg fade-in border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">MetCon Only</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold shadow"
            title="Copy to clipboard"
          >📋 Copy</button>
          <ExportButton targetId="metcon-card" />
          {onFavorite && (
            <button
              onClick={() => onFavorite({ wod: metcon })}
              className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded text-sm font-semibold shadow flex items-center gap-1"
              title="Add to Favorites"
            >
              <span role="img" aria-label="favorite">❤️</span> Favorite
            </button>
          )}
        </div>
      </div>
      <div className="mb-2 text-blue-300 font-semibold text-lg">{metcon.type}</div>
      <div className="mb-2 text-white/80 italic">{metcon.description}</div>
      <ul className="list-disc pl-5">
        {metcon.exercises.map((ex, idx) => (
          <li key={idx} className="mb-2 flex items-center gap-2 fade-in">{ex}</li>
        ))}
      </ul>
      <button
        onClick={handleRegenerate}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >Regenerate MetCon</button>
    </div>
  );
}
