import React, { useEffect, useState, useRef } from "react";
import generateWorkout from "../utils/generateWorkout";
import html2canvas from "html2canvas";

export default function MetconOnlyGenerator({ intensity, onGenerate, onFavorite }) {
  const [metcon, setMetcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenKey, setRegenKey] = useState(0);
  const [shareLoading, setShareLoading] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [timeCap, setTimeCap] = useState(10);
  const [repScheme, setRepScheme] = useState("21-15-9");

  // Store custom values at the time of regeneration
  const customRef = useRef({ rounds, timeCap, repScheme, customize });

  // Only regenerate when clicking Regenerate, not on every change
  useEffect(() => { setRegenKey((k) => k + 1); }, [intensity]);
  const handleRegenerate = () => {
    customRef.current = { rounds, timeCap, repScheme, customize };
    setRegenKey((k) => k + 1);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    const custom = customRef.current.customize
      ? { metconOnly: true, rounds: customRef.current.rounds, timeCap: customRef.current.timeCap, repScheme: customRef.current.repScheme }
      : { metconOnly: true };
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

  // Share as image handler
  const handleShareImage = async () => {
    setShareLoading(true);
    const el = document.getElementById("metcon-card");
    if (!el) {
      setShareLoading(false);
      alert("Could not find MetCon card to share.");
      return;
    }
    try {
      el.classList.add('export-plain', 'exporting');
      // Hide all images inside the card for debugging
      const imgs = el.querySelectorAll('img');
      const prevDisplay = [];
      imgs.forEach(img => {
        prevDisplay.push(img.style.display);
        img.style.display = 'none';
      });
      // Wait a tick to ensure DOM is rendered
      await new Promise(res => setTimeout(res, 100));
      const canvas = await html2canvas(el, { backgroundColor: '#fff', logging: true });
      el.classList.remove('export-plain', 'exporting');
      // Restore images
      imgs.forEach((img, i) => { img.style.display = prevDisplay[i]; });
      canvas.toBlob(async (blob) => {
        // ...existing code for sharing or downloading...
      }, "image/png");
    } catch (err) {
      el.classList.remove('export-plain', 'exporting');
      setShareLoading(false);
      console.error("html2canvas error:", err);
      alert("Failed to generate image for sharing. See console for details.");
    }
  };

  // Remove share, favorite, customize, and demo links from export/share card
  // Only show the workout content
  if (loading) return <div className="mt-8 text-center text-lg text-blue-400">Generating MetCon...</div>;
  if (error) return <div className="mt-8 text-center text-red-500">{error}</div>;
  if (!metcon) return null;

  return (
    <div id="metcon-card" className="mt-8 w-full max-w-2xl glassy text-white p-2 sm:p-6 rounded-lg shadow-lg fade-in border border-white/10 relative">
      <div className="absolute bottom-2 right-4 text-xs text-white/40 select-none">wodshuffler.app</div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-3xl font-bold">MetCon Only</h2>
        <div className="flex gap-2 flex-wrap justify-center hide-for-export">
          <button
            onClick={handleShareImage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold shadow min-w-[44px] min-h-[44px] flex items-center gap-2 disabled:opacity-60"
            title="Share as image"
            disabled={shareLoading}
          >
            {shareLoading ? 'Sharing...' : <><span role="img" aria-label="share">🔗</span> Share</>}
          </button>
          {onFavorite && (
            <button
              onClick={() => onFavorite({ wod: metcon })}
              className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded text-sm font-semibold shadow flex items-center justify-center min-w-[44px] min-h-[44px]"
              title="Add to Favorites"
            >
              <span role="img" aria-label="favorite">❤️</span>
            </button>
          )}
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2 hide-for-export">
        <input
          type="checkbox"
          id="customize-metcon"
          checked={customize}
          onChange={e => setCustomize(e.target.checked)}
          className="accent-blue-600 w-5 h-5"
        />
        <label htmlFor="customize-metcon" className="text-white text-sm font-semibold cursor-pointer">Customize rounds, time cap, rep scheme</label>
      </div>
      {customize && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center hide-for-export">
          <div>
            <label className="block text-xs mb-1">Rounds</label>
            <input
              type="number"
              min={1}
              max={10}
              value={rounds}
              onChange={e => setRounds(Number(e.target.value))}
              className="w-16 rounded bg-white/10 text-white px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Time Cap (min)</label>
            <input
              type="number"
              min={5}
              max={60}
              value={timeCap}
              onChange={e => setTimeCap(Number(e.target.value))}
              className="w-20 rounded bg-white/10 text-white px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Rep Scheme</label>
            <select
              value={repScheme}
              onChange={e => setRepScheme(e.target.value)}
              className="rounded bg-white/10 text-white px-2 py-1"
            >
              <option value="21-15-9">21-15-9</option>
              <option value="5 Rounds x 10 reps">5 Rounds x 10 reps</option>
              <option value="AMRAP">AMRAP</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRegenerate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold shadow min-w-[44px] min-h-[44px] flex items-center gap-2"
              title="Regenerate MetCon with these settings"
            >
              <span role="img" aria-label="refresh">🔄</span> Regenerate
            </button>
          </div>
        </div>
      )}
      <div className="mb-2 text-blue-300 font-semibold text-lg">{metcon.type}</div>
      <div className="mb-2 text-white/80 italic">{metcon.description}</div>
      <ul className="list-disc pl-5">
        {metcon.exercises.map((ex, idx) => (
          <li key={idx} className="mb-2 flex items-center gap-2 fade-in">{ex}</li>
        ))}
      </ul>
      <button
        onClick={handleRegenerate}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 min-h-[44px] hide-for-export"
      >Regenerate MetCon</button>
    </div>
  );
}
