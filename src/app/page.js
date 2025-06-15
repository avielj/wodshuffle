"use client";
import React, { useState } from "react";
import BodyPartSelector from "../components/BodyPartSelector";
import WorkoutGenerator from "../components/WorkoutGenerator";
import EquipmentSelector from "../components/EquipmentSelector";

const NAV_LINKS = [
  { name: "WOD Generator", href: "#" },
  { name: "My Workouts", href: "#" },
  { name: "Quick Stats", href: "#" },
];

export default function Home() {
  const [bodyParts, setBodyParts] = useState([]);
  const [intensity, setIntensity] = useState("rx");
  const [workoutKey, setWorkoutKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [equipment, setEquipment] = useState([]);

  // Load preferences on mount (optional, can be removed if not needed)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("wodPrefs") || "{}" );
      setBodyParts(saved.bodyParts || []);
      setIntensity(saved.intensity || "rx");
      setFavorites(JSON.parse(localStorage.getItem("wodFavorites") || "[]"));
      setGeneratedCount(Number(localStorage.getItem("wodGeneratedCount") || 0));
    }
  }, []);

  const handleGenerate = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wodPrefs", JSON.stringify({ bodyParts, intensity }));
      setWorkoutKey((k) => k + 1);
      setGeneratedCount((c) => {
        const newCount = c + 1;
        localStorage.setItem("wodGeneratedCount", newCount);
        return newCount;
      });
    }
  };

  const handleFavorite = (workout) => {
    if (typeof window !== "undefined") {
      setFavorites((prev) => {
        const updated = [...prev, workout];
        localStorage.setItem("wodFavorites", JSON.stringify(updated));
        return updated;
      });
    }
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
      <main className="max-w-2xl mx-auto p-2 mt-2">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md shadow-lg p-4 border border-white/10">
          <h1 className="text-2xl font-bold mb-2 text-center text-white">WOD Shuffler</h1>
          <p className="text-center text-white/70 mb-4">Create personalized CrossFit workouts tailored to your goals and intensity level</p>
          <EquipmentSelector selectedEquipment={equipment} onChange={setEquipment} />
          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-1 text-white">Target Muscle Groups</h2>
            <BodyPartSelector selectedBodyParts={bodyParts} onChange={setBodyParts} />
            <div className="flex justify-between items-center mt-1 text-xs">
              <span className="text-blue-400 font-semibold">{bodyParts.length}/3 muscle groups selected</span>
              <button className="text-xs text-red-400 hover:underline" onClick={() => setBodyParts([])}>Clear All</button>
            </div>
          </section>
          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-1 text-white">Intensity Level</h2>
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              <div
                className={`rounded p-2 border text-xs flex flex-col items-center cursor-pointer min-w-[80px] ${intensity==='scaled'?'border-green-400 bg-green-900/30 ring-2 ring-green-400':'border-white/10 bg-white/5'}`}
                onClick={() => setIntensity('scaled')}
              >
                <div className="flex items-center gap-1 font-bold text-green-400">⚡<span>Scaled</span></div>
                <div className="text-[10px] text-white/60">Beginner</div>
              </div>
              <div
                className={`rounded p-2 border text-xs flex flex-col items-center cursor-pointer min-w-[80px] ${intensity==='rx'?'border-blue-400 bg-blue-900/30 ring-2 ring-blue-400':'border-white/10 bg-white/5'}`}
                onClick={() => setIntensity('rx')}
              >
                <div className="flex items-center gap-1 font-bold text-blue-400">🔥<span>RX</span></div>
                <div className="text-[10px] text-white/60">Standard</div>
              </div>
              <div
                className={`rounded p-2 border text-xs flex flex-col items-center cursor-pointer min-w-[80px] ${intensity==='athlete'?'border-pink-400 bg-pink-900/30 ring-2 ring-pink-400':'border-white/10 bg-white/5'}`}
                onClick={() => setIntensity('athlete')}
              >
                <div className="flex items-center gap-1 font-bold text-pink-400">🚀<span>Athlete</span></div>
                <div className="text-[10px] text-white/60">Elite</div>
              </div>
            </div>
          </section>
          <button
            onClick={handleGenerate}
            className="w-full bg-blue-600 text-white py-2 px-2 rounded-md hover:bg-blue-700 text-base font-semibold mb-4 transition-colors duration-150"
            disabled={bodyParts.length === 0}
          >
            Generate WOD
          </button>
          {bodyParts.length > 0 && (
            <WorkoutGenerator
              muscleGroups={bodyParts}
              intensity={intensity}
              equipment={equipment}
              key={workoutKey}
              onFavorite={handleFavorite}
            />
          )}
        </div>
      </main>
    </div>
  );
}
