"use client";
import React, { useState, useEffect } from "react";
import BodyPartSelector from "../components/BodyPartSelector";
import WorkoutGenerator from "../components/WorkoutGenerator";
import EquipmentSelector from "../components/EquipmentSelector";
import FavoritesList from "../components/FavoritesList";
import HistoryList from "../components/HistoryList";
import UserProfile from "../components/UserProfile";
import MetconOnlyGenerator from "../components/MetconOnlyGenerator";

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
  const [theme, setTheme] = useState('dark');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: "", avatar: "" });
  const [showMetconOnly, setShowMetconOnly] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Load preferences and history on mount (optional, can be removed if not needed)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("wodPrefs") || "{}" );
      setBodyParts(saved.bodyParts || []);
      setIntensity(saved.intensity || "rx");
      setFavorites(JSON.parse(localStorage.getItem("wodFavorites") || "[]"));
      setGeneratedCount(Number(localStorage.getItem("wodGeneratedCount") || 0));
      const savedTheme = localStorage.getItem("wodTheme") || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      setHistory(JSON.parse(localStorage.getItem("wodHistory") || "[]"));
      const profileData = JSON.parse(localStorage.getItem("wodProfile") || "{}");
      setProfile(profileData);
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
      setCollapsed(true);
    }
  };
  const handleCollapseReset = () => setCollapsed(false);

  const handleFavorite = (workout) => {
    if (typeof window !== "undefined") {
      setFavorites((prev) => {
        const updated = [...prev, workout];
        localStorage.setItem("wodFavorites", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleRemoveFavorite = (idx) => {
    setFavorites((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (typeof window !== "undefined") {
        localStorage.setItem("wodFavorites", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleRegenerateFavorite = (wod) => {
    // Just set the workoutKey to force re-generation with the same params
    setWorkoutKey((k) => k + 1);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("wodTheme", next);
      document.documentElement.setAttribute('data-theme', next);
    }
  };

  // Save to history when a new workout is generated
  const handleAddToHistory = (workout) => {
    if (typeof window !== "undefined") {
      const entry = { ...workout, generatedAt: Date.now() };
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, 50); // keep last 50
        localStorage.setItem("wodHistory", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("wodHistory");
    }
  };

  const handleSaveProfile = (data) => {
    setProfile(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("wodProfile", JSON.stringify(data));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md shadow flex flex-col sm:flex-row items-center justify-between px-2 sm:px-6 py-2 sm:py-3 border-b border-white/10 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <img src={profile.avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=CrossFitter"} alt="Avatar" className="h-8 w-8 rounded border" />
          <span className="font-bold text-lg sm:text-xl tracking-tight text-blue-400">WOD Shuffler</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-center w-full sm:w-auto">
          <button
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="ml-4 px-3 py-1 rounded bg-white/10 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
          </button>
          <button
            className="ml-2 px-3 py-1 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-colors"
            onClick={() => setShowFavorites((v) => !v)}
            aria-pressed={showFavorites}
          >
            {showFavorites ? 'Hide Favorites' : 'View Favorites'}
          </button>
          <button
            className="ml-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            onClick={() => setShowHistory((v) => !v)}
            aria-pressed={showHistory}
          >
            {showHistory ? 'Hide History' : 'View History'}
          </button>
          <button
            className="ml-2 px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold transition-colors"
            onClick={() => setShowProfile((v) => !v)}
            aria-pressed={showProfile}
          >
            {showProfile ? 'Hide Profile' : 'Profile'}
          </button>
          <button
            className="ml-2 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
            onClick={() => setShowMetconOnly((v) => !v)}
            aria-pressed={showMetconOnly}
          >
            {showMetconOnly ? 'WOD Generator' : 'MetCon Only'}
          </button>
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 py-3 mt-3 mb-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md gap-2 sm:gap-0">
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
      <main className="max-w-2xl mx-auto p-1 sm:p-2 mt-2 fade-in">
        <div className="rounded-2xl glassy shadow-lg p-2 sm:p-4 border border-white/10 fade-in">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center text-white">WOD Shuffler</h1>
          <p className="text-center text-white/70 mb-4 text-sm sm:text-base">Create personalized CrossFit workouts tailored to your goals and intensity level</p>
          <div className={`transition-all duration-500 overflow-hidden ${collapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[1000px] opacity-100'}`}> 
            {!showMetconOnly && <EquipmentSelector selectedEquipment={equipment} onChange={setEquipment} />}
            <section className="mb-4">
              {!showMetconOnly && (
                <>
                  <h2 className="text-base sm:text-lg font-semibold mb-1 text-white">Target Muscle Groups</h2>
                  <BodyPartSelector selectedBodyParts={bodyParts} onChange={setBodyParts} />
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-1 text-xs gap-1 sm:gap-0">
                    <span className="text-blue-400 font-semibold">{bodyParts.length}/3 muscle groups selected</span>
                    <button className="text-xs text-red-400 hover:underline" onClick={() => setBodyParts([])}>Clear All</button>
                  </div>
                </>
              )}
            </section>
            <section className="mb-4">
              <h2 className="text-base sm:text-lg font-semibold mb-1 text-white">Intensity Level</h2>
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
          </div>
          <button
            onClick={handleGenerate}
            className="w-full bg-blue-600 text-white py-2 px-2 rounded-md hover:bg-blue-700 text-base font-semibold mb-4 transition-colors duration-150 min-h-[44px]"
            disabled={bodyParts.length === 0}
          >
            Generate WOD
          </button>
          {collapsed && (
            <button
              onClick={handleCollapseReset}
              className="w-full bg-gray-700 text-white py-2 px-2 rounded-md hover:bg-gray-800 text-base font-semibold mb-4 transition-colors duration-150"
            >
              Edit Selection
            </button>
          )}
          {showProfile ? (
            <UserProfile profile={profile} onSave={handleSaveProfile} />
          ) : showFavorites ? (
            <FavoritesList
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onRegenerate={handleRegenerateFavorite}
            />
          ) : showHistory ? (
            <HistoryList
              history={history}
              onClear={handleClearHistory}
            />
          ) : showMetconOnly ? (
            <MetconOnlyGenerator
              intensity={intensity}
              onFavorite={handleFavorite}
              onGenerate={handleAddToHistory}
            />
          ) : (
            <>
              {bodyParts.length > 0 && collapsed && (
                <WorkoutGenerator
                  muscleGroups={bodyParts}
                  intensity={intensity}
                  equipment={equipment}
                  key={workoutKey}
                  onFavorite={handleFavorite}
                  onGenerate={handleAddToHistory}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
