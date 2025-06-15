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

const ADMIN_EMAIL = "avielj@gmail.com";

const getUserKey = (profile) => profile?.email || '';

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
  const [profile, setProfile] = useState({ name: "", avatar: "", email: "" });
  const [showMetconOnly, setShowMetconOnly] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [globalWodsGenerated, setGlobalWodsGenerated] = useState(0);
  // Tab state for navigation
  const [activeTab, setActiveTab] = useState('generator');

  // Load preferences and history on mount (optional, can be removed if not needed)
  React.useEffect(() => {
    // Load preferences and theme from localStorage
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("wodPrefs") || "{}" );
      setBodyParts(saved.bodyParts || []);
      setIntensity(saved.intensity || "rx");
      const profileData = JSON.parse(localStorage.getItem("wodProfile") || "{}" );
      setProfile(profileData);
      const savedTheme = localStorage.getItem("wodTheme") || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      // Fetch favorites and history from API if logged in
      if (profileData.id) {
        fetch(`/api/user/favorites?userId=${profileData.id}`)
          .then(res => res.json())
          .then(data => setFavorites(data || []));
        fetch(`/api/user/history?userId=${profileData.id}`)
          .then(res => res.json())
          .then(data => setHistory(data || []));
      }
    }
  }, []);

  // Fetch global WODs generated count on mount
  useEffect(() => {
    fetch('/api/global-stats/wods-generated')
      .then(res => res.json())
      .then(data => setGlobalWodsGenerated(data.wodsGenerated || 0));
  }, []);

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wodProfile");
      // Optionally clear user-specific favorites/history
      window.location.reload();
    }
  };

  const handleGenerate = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wodPrefs", JSON.stringify({ bodyParts, intensity }));
      setWorkoutKey((k) => k + 1);
      setGeneratedCount((c) => {
        const newCount = c + 1;
        localStorage.setItem("wodGeneratedCount", newCount);
        return newCount;
      });
      setCollapsed(true);
      // Increment global counter in DB
      try {
        const res = await fetch('/api/global-stats/wods-generated', { method: 'POST' });
        const data = await res.json();
        setGlobalWodsGenerated(data.wodsGenerated || 0);
      } catch (e) {
        // Optionally handle error
      }
    }
  };
  const handleCollapseReset = () => setCollapsed(false);

  const handleFavorite = async (workout) => {
    if (profile?.id && workout?.wod?.id) {
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, wodId: workout.wod.id })
      });
      // Refresh favorites
      const res = await fetch(`/api/user/favorites?userId=${profile.id}`);
      setFavorites(await res.json());
    }
  };

  const handleRemoveFavorite = async (idx) => {
    if (profile?.id && favorites[idx]?.wodId) {
      await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, wodId: favorites[idx].wodId })
      });
      // Refresh favorites
      const res = await fetch(`/api/user/favorites?userId=${profile.id}`);
      setFavorites(await res.json());
    }
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
  const handleAddToHistory = async (workout) => {
    if (profile?.id && workout?.wod?.id) {
      await fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, wodId: workout.wod.id })
      });
      // Refresh history
      const res = await fetch(`/api/user/history?userId=${profile.id}`);
      setHistory(await res.json());
    }
  };

  const handleClearHistory = async () => {
    if (profile?.id) {
      // Remove all history for this user
      for (const entry of history) {
        await fetch('/api/user/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.id, wodId: entry.wodId })
        });
      }
      setHistory([]);
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
      {/* Navigation Tabs */}
      <nav className="bg-black/80 backdrop-blur-md shadow flex flex-col sm:flex-row items-center justify-between px-2 sm:px-6 py-2 sm:py-3 border-b border-white/10 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <img src={profile.avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=CrossFitter"} alt="Avatar" className="h-8 w-8 rounded border" />
          <span className="font-bold text-lg sm:text-xl tracking-tight text-blue-400">WOD Shuffler</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-center w-full sm:w-auto">
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='generator' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => setActiveTab('generator')}
          >WOD Generator</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='metcon' ? 'bg-green-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => setActiveTab('metcon')}
          >Metcon Generator</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='favorites' ? 'bg-pink-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => setActiveTab('favorites')}
          >Favorites</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='history' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => setActiveTab('history')}
          >History</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='profile' ? 'bg-gray-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => setActiveTab('profile')}
          >Profile</button>
          {profile?.email === ADMIN_EMAIL && (
            <a href="/admin" className="ml-2 px-3 py-1 rounded bg-yellow-500 text-black text-sm font-semibold transition-colors">Admin</a>
          )}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 py-3 mt-3 mb-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md gap-2 sm:gap-0">
        {/* Removed local Generated WODs stat */}
        <div className="flex flex-col items-center">
          <span className="text-pink-400 font-bold text-2xl">{favorites.length}</span>
          <span className="text-xs text-white/70">Favorites</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue-400 font-bold text-2xl">{globalWodsGenerated}</span>
          <span className="text-xs text-white/70">Global WODs Generated</span>
        </div>
      </div>

      {/* Main Content by Tab */}
      <main className="max-w-2xl mx-auto p-1 sm:p-2 mt-2 fade-in">
        <div className="rounded-2xl glassy shadow-lg p-2 sm:p-4 border border-white/10 fade-in">
          {activeTab === 'profile' ? (
            <div>
              <UserProfile profile={profile} onSave={handleSaveProfile} />
              {profile?.email && (
                <button onClick={handleLogout} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-2 rounded-md font-semibold transition-colors min-h-[44px]">Logout</button>
              )}
            </div>
          ) : activeTab === 'favorites' ? (
            <FavoritesList
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onRegenerate={handleRegenerateFavorite}
            />
          ) : activeTab === 'history' ? (
            <HistoryList
              history={history}
              onClear={handleClearHistory}
            />
          ) : activeTab === 'metcon' ? (
            <MetconOnlyGenerator
              intensity={intensity}
              onFavorite={handleFavorite}
              onGenerate={handleAddToHistory}
            />
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center text-white">WOD Shuffler</h1>
              <p className="text-center text-white/70 mb-4 text-sm sm:text-base">Create personalized CrossFit workouts tailored to your goals and intensity level</p>
              <div className={`transition-all duration-500 overflow-hidden ${collapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[1000px] opacity-100'}`}> 
                <EquipmentSelector selectedEquipment={equipment} onChange={setEquipment} />
                <section className="mb-4">
                  <h2 className="text-base sm:text-lg font-semibold mb-1 text-white">Target Muscle Groups</h2>
                  <BodyPartSelector selectedBodyParts={bodyParts} onChange={setBodyParts} />
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-1 text-xs gap-1 sm:gap-0">
                    <span className="text-blue-400 font-semibold">{bodyParts.length}/3 muscle groups selected</span>
                    <button className="text-xs text-red-400 hover:underline" onClick={() => setBodyParts([])}>Clear All</button>
                  </div>
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
