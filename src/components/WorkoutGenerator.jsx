import React, { useEffect, useState } from "react";
import generateWorkout from "../utils/generateWorkout";
import html2canvas from "html2canvas";

export default function WorkoutGenerator({ muscleGroups, intensity, equipment = [], onGenerate, onFavorite }) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenKey, setRegenKey] = useState(0);
  const [shareLoading, setShareLoading] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [timeCap, setTimeCap] = useState(10);
  const [repScheme, setRepScheme] = useState("21-15-9");

  useEffect(() => {
    setRegenKey((k) => k + 1);
  }, [muscleGroups, intensity]);

  const handleRegenerate = () => setRegenKey((k) => k + 1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    generateWorkout(
      muscleGroups,
      intensity,
      equipment,
      customize ? { rounds, timeCap, repScheme } : {}
    )
      .then((wod) => {
        if (isMounted) {
          setWorkout(wod);
          setLoading(false);
          if (onGenerate) onGenerate(wod);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Failed to load workout data.");
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [muscleGroups, intensity, equipment, regenKey, customize, rounds, timeCap, repScheme]);

  // Share as image handler
  const handleShareImage = async () => {
    setShareLoading(true);
    const el = document.getElementById("wod-card");
    if (!el) {
      setShareLoading(false);
      alert("Could not find workout card to share.");
      return;
    }
    try {
      el.classList.add('export-plain', 'exporting');
      // Wait a tick to ensure DOM is rendered
      await new Promise(res => setTimeout(res, 100));
      console.log('Starting html2canvas...');
      const canvas = await html2canvas(el, { backgroundColor: '#fff' });
      el.classList.remove('export-plain', 'exporting');
      if (!canvas) {
        alert('Failed to generate image. Canvas is null.');
        setShareLoading(false);
        return;
      }
      console.log('Canvas generated.');
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate image blob.');
          setShareLoading(false);
          return;
        }
        const file = new File([blob], "wod.png", { type: blob.type });
        let shared = false;
        if (
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            console.log('Attempting to share...');
            await navigator.share({
              files: [file],
              title: "WOD Shuffler Workout",
              text: `Generated with WOD Shuffler`,
            });
            shared = true;
            console.log('Share successful.');
          } catch (err) {
            // Sharing was cancelled or failed, will fall back to download
          }
        }
        if (!shared) {
          // fallback: download
          console.log('Falling back to download.');
          const link = document.createElement("a");
          link.download = "wod.png";
          link.href = canvas.toDataURL();
          link.click();
          alert("Sharing as image is not supported or was cancelled. Image downloaded instead.");
        }
        setShareLoading(false);
      }, "image/png");
    } catch (err) {
      el.classList.remove('export-plain', 'exporting');
      setShareLoading(false);
      alert("Failed to generate image for sharing. See console for details.");
    }
  };

  if (loading) return <div className="mt-8 text-center text-lg text-blue-400">Generating your workout...</div>;
  if (error) return <div className="mt-8 text-center text-red-500">{error}</div>;
  if (!workout) return null;

  return (
    <div id="wod-card" className="w-full max-w-xl mx-auto bg-white/5 rounded-xl border border-white/10 p-2 sm:p-4 mb-4 glassy fade-in relative">
      <div className="absolute bottom-2 right-4 text-xs text-white/40 select-none">wodshuffler.app</div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Your CrossFit Workout</h2>
        <div className="flex gap-2 hide-for-export">
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
              onClick={() => onFavorite(workout)}
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
          id="customize-wod"
          checked={customize}
          onChange={e => setCustomize(e.target.checked)}
          className="accent-blue-600 w-5 h-5"
        />
        <label htmlFor="customize-wod" className="text-white text-sm font-semibold cursor-pointer">Customize rounds, time cap, rep scheme</label>
      </div>
      {customize && (
        <div className="flex flex-col md:flex-row gap-4 mb-4 hide-for-export">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Rounds</label>
            <input type="number" min={1} max={10} value={rounds} onChange={e => setRounds(Number(e.target.value))} className="w-full rounded bg-white/10 text-white px-2 py-1" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Time Cap (min)</label>
            <input type="number" min={5} max={60} value={timeCap} onChange={e => setTimeCap(Number(e.target.value))} className="w-full rounded bg-white/10 text-white px-2 py-1" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Rep Scheme</label>
            <select value={repScheme} onChange={e => setRepScheme(e.target.value)} className="w-full rounded bg-white/10 text-white px-2 py-1">
              <option value="21-15-9">21-15-9</option>
              <option value="5-5-5">5-5-5</option>
              <option value="10-8-6">10-8-6</option>
              <option value="AMRAP">AMRAP</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRegenerate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold shadow min-w-[44px] min-h-[44px] flex items-center gap-2"
              title="Regenerate workout with these settings"
            >
              <span role="img" aria-label="refresh">🔄</span> Regenerate
            </button>
          </div>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Warmup</h3>
        <ul className="list-disc pl-5">
          {Array.isArray(workout.warmup)
            ? workout.warmup.map((wu, idx) => (
                <li key={idx} className="fade-in">
                  <span className="font-medium">{wu.name}</span>: {wu.reps?.[intensity] || wu.duration?.[intensity] || wu.reps || wu.duration}
                  <br />
                  <span className="text-sm text-gray-300">Equipment: {Array.isArray(wu.equipment) ? wu.equipment.join(", ") : wu.equipment}</span>
                  {wu.progression && (
                    <div className="text-xs text-green-300 mt-1">Progression: {wu.progression}</div>
                  )}
                  {wu.demo && (
                    <a href={wu.demo} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 underline ml-2 hide-for-export">Demo</a>
                  )}
                </li>
              ))
            : null}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Strength</h3>
        <ul className="list-disc pl-5">
          {workout.strength.length === 0 && <li className="text-gray-400 fade-in">No strength exercises found for selection.</li>}
          {workout.strength.map((ex, idx) => (
            <li key={idx} className="mb-2 fade-in">
              <span className="font-medium">{ex.name}</span>: {ex.sets} sets x {typeof ex.reps === 'string' ? ex.reps : ex.reps} {ex.weight && `@ ${ex.weight}`} {ex.rest && <span className="text-xs text-gray-400">(Rest: {ex.rest})</span>}
              {ex.progression && (
                <div className="text-xs text-green-300 mt-1">Progression: {ex.progression}</div>
              )}
              {ex.demo && (
                <a href={ex.demo} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 underline ml-2 hide-for-export">Demo</a>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-2xl font-semibold">MetCon: {workout.wod.name}</h3>
        </div>
        <div className="mb-2 text-blue-300 font-semibold text-lg">
          {workout.wod.type}
        </div>
        <div className="mb-2 text-white/80 italic">{workout.wod.description}</div>
        <ul className="list-disc pl-5">
          {workout.wod.exercises.map((ex, idx) => (
            <li key={idx} className="mb-2 flex items-center gap-2 fade-in">
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
