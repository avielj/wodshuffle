"use client";
import React, { useState } from "react";
import BodyPartSelector from "../components/BodyPartSelector";
import WorkoutGenerator from "../components/WorkoutGenerator";

const NAV_LINKS = [
  { name: "WOD Generator", href: "#" },
  { name: "My Workouts", href: "#" },
  { name: "Quick Stats", href: "#" },
];

export default function Home() {
  const [bodyParts, setBodyParts] = useState([]);
  const [intensity, setIntensity] = useState("rx");
  const [workoutKey, setWorkoutKey] = useState(0);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("wodFavorites") || "[]"));
  const [generatedCount, setGeneratedCount] = useState(() => Number(localStorage.getItem("wodGeneratedCount") || 0));

  // Load preferences on mount (optional, can be removed if not needed)
  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wodPrefs") || "{}" );
    setBodyParts(saved.bodyParts || []);
    setIntensity(saved.intensity || "rx");
  }, []);

  const handleGenerate = () => {
    localStorage.setItem("wodPrefs", JSON.stringify({ bodyParts, intensity }));
    setWorkoutKey((k) => k + 1);
    setGeneratedCount((c) => {
      const newCount = c + 1;
      localStorage.setItem("wodGeneratedCount", newCount);
      return newCount;
    });
  };

  const handleFavorite = (workout) => {
    setFavorites((prev) => {
      const updated = [...prev, workout];
      localStorage.setItem("wodFavorites", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md shadow flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/66a45d17d_logo.png" alt="Base44 Logo" className="h-8 w-8 rounded" />
          <span className="font-bold text-xl tracking-tight text-blue-400">WOD Shuffler</span>
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="max-w-2xl mx-auto flex justify-between items-center px-4 py-4 mt-4 mb-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="flex flex-col items-center">
          <span className="text-blue-400 font-bold text-2xl">{generatedCount}</span>
          <span className="text-xs text-white/70">Generated WODs</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-pink-400 font-bold text-2xl">{favorites.length}</span>
          <span className="text-xs text-white/70">Favorites</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 mt-2">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md shadow-lg p-8 border border-white/10">
          <h1 className="text-3xl font-bold mb-2 text-center text-white">WOD Shuffler</h1>
          <p className="text-center text-white/70 mb-8">Create personalized CrossFit workouts tailored to your goals and intensity level</p>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-white">Target Muscle Groups</h2>
            <p className="text-white/60 mb-4">Select up to 3 muscle groups to focus on</p>
            <BodyPartSelector selectedBodyParts={bodyParts} onChange={setBodyParts} />
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-blue-400 font-semibold">{bodyParts.length}/3 muscle groups selected</span>
              <button className="text-xs text-red-400 hover:underline" onClick={() => setBodyParts([])}>Clear All</button>
            </div>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-white">Intensity Level</h2>
            <p className="text-white/60 mb-4">Choose your workout intensity</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div
                className={`rounded-lg p-3 border transition-colors duration-150 flex flex-col items-start cursor-pointer ${intensity==='scaled'?'border-green-400 bg-green-900/30 ring-2 ring-green-400':'border-white/10 bg-white/5'}`}
                onClick={() => setIntensity('scaled')}
              >
                <div className="flex items-center gap-2 font-bold text-green-400 text-lg">⚡<span>Scaled</span></div>
                <div className="text-xs text-white/60">Beginner-friendly modifications</div>
                <div className="text-xs mt-1">Modified movements, lighter weights, and reduced volume</div>
              </div>
              <div
                className={`rounded-lg p-3 border transition-colors duration-150 flex flex-col items-start cursor-pointer ${intensity==='rx'?'border-blue-400 bg-blue-900/30 ring-2 ring-blue-400':'border-white/10 bg-white/5'}`}
                onClick={() => setIntensity('rx')}
              >
                <div className="flex items-center gap-2 font-bold text-blue-400 text-lg">🔥<span>RX</span></div>
                <div className="text-xs text-white/60">As prescribed standard</div>
                <div className="text-xs mt-1">Standard CrossFit workout as written</div>
              </div>
              <div
                className={`rounded-lg p-3 border transition-colors duration-150 flex flex-col items-start cursor-pointer ${intensity==='athlete'?'border-pink-400 bg-pink-900/30 ring-2 ring-pink-400':'border-white/10 bg-white/5'}`}
                onClick={() => setIntensity('athlete')}
              >
                <div className="flex items-center gap-2 font-bold text-pink-400 text-lg">🚀<span>Athlete</span></div>
                <div className="text-xs text-white/60">Elite performance level</div>
                <div className="text-xs mt-1">Advanced movements, heavier weights, and increased volume</div>
              </div>
            </div>
          </section>
          <button
            onClick={handleGenerate}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 text-lg font-semibold mb-6 transition-colors duration-150"
            disabled={bodyParts.length === 0}
          >
            Generate WOD
          </button>
          {bodyParts.length > 0 && (
            <WorkoutGenerator
              muscleGroups={bodyParts}
              intensity={intensity}
              key={workoutKey}
              onFavorite={handleFavorite}
            />
          )}
        </div>
      </main>
    </div>
  );
}
