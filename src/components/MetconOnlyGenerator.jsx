import React, { useEffect, useState } from "react";
import generateWorkout from "../utils/generateWorkout";
import html2canvas from "html2canvas";

export default function MetconOnlyGenerator({ intensity, onFavorite, onGenerate }) {
  const [metcon, setMetcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenKey, setRegenKey] = useState(0);
  // Customization state
  const [customize, setCustomize] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [timeCap, setTimeCap] = useState(20);
  const [repScheme, setRepScheme] = useState("21-15-9");
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => { setRegenKey((k) => k + 1); }, [intensity]);
  const handleRegenerate = () => setRegenKey((k) => k + 1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    const custom = customize ? { metconOnly: true, rounds, timeCap, repScheme } : { metconOnly: true };
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
  }, [intensity, regenKey, customize, rounds, timeCap, repScheme]);

  if (loading) return <div className="mt-8 text-center text-lg text-blue-400">Generating MetCon...</div>;
  if (error) return <div className="mt-8 text-center text-red-500">{error}</div>;
  if (!metcon) return null;

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
      const canvas = await html2canvas(el, { backgroundColor: null });
      canvas.toBlob(async (blob) => {
        if (
          navigator.canShare &&
          navigator.canShare({ files: [new File([blob], "metcon.png", { type: blob.type })] })
        ) {
          try {
            await navigator.share({
              files: [new File([blob], "metcon.png", { type: blob.type })],
              title: "WOD Shuffler MetCon",
              text: `Generated with WOD Shuffler: https://app.base44.com`,
            });
          } catch (err) {
            alert("Sharing was cancelled or failed.");
          }
        } else {
          // fallback: download
          const link = document.createElement("a");
          link.download = "metcon.png";
          link.href = canvas.toDataURL();
          link.click();
          alert("Sharing as image is not supported on this device. Image downloaded instead.");
        }
        setShareLoading(false);
      }, "image/png");
    } catch (err) {
      setShareLoading(false);
      alert("Failed to generate image for sharing.");
    }
  };

  return (
    <div id="metcon-card" className="mt-8 w-full max-w-2xl glassy text-white p-2 sm:p-6 rounded-lg shadow-lg fade-in border border-white/10 relative">
      <div className="absolute bottom-2 right-4 text-xs text-white/40 select-none">wodshuffler.app</div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-3xl font-bold">MetCon Only</h2>
        <div className="flex gap-2 flex-wrap justify-center">
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
      <div className="mb-4 flex items-center gap-2">
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
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
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
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 min-h-[44px]"
      >Regenerate MetCon</button>
    </div>
  );
}
