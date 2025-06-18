"use client";
import React, { useState, useEffect } from "react";
import BodyPartSelector from "../components/BodyPartSelector";
import WorkoutGenerator from "../components/WorkoutGenerator";
import EquipmentSelector from "../components/EquipmentSelector";
import FavoritesList from "../components/FavoritesList";
import HistoryList from "../components/HistoryList";
import UserProfile from "../components/UserProfile";
import MetconOnlyGenerator from "../components/MetconOnlyGenerator";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FaBars, FaTimes } from "react-icons/fa";

const NAV_LINKS = [
  { name: "WOD Generator", href: "#" },
  { name: "My Workouts", href: "#" },
  { name: "Quick Stats", href: "#" },
];

const ADMIN_EMAIL = "avielj@gmail.com";

const getUserKey = (profile) => profile?.email || '';
const WODTimer = dynamic(() => import("../components/WODTimer.jsx"), { ssr: false });

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
  const [mounted, setMounted] = React.useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Tab state for navigation
  const [activeTab, setActiveTab] = useState('generator');

  React.useEffect(() => { setMounted(true); }, []);

  // Load user profile from API on mount (replace localStorage logic)
  React.useEffect(() => {
    async function loadProfileAndData() {
      // Only fetch profile if localStorage says user is logged in
      if (typeof window !== 'undefined' && !localStorage.getItem('wodIsLoggedIn')) {
        setProfile({});
        setFavorites([]);
        setHistory([]);
        return;
      }
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          setProfile(user);
          // Fetch favorites and history from API
          const favRes = await fetch(`/api/user/favorites?userId=${user.id}`);
          setFavorites(await favRes.json());
          const histRes = await fetch(`/api/user/history?userId=${user.id}`);
          setHistory(await histRes.json());
        } else if (res.status === 401) {
          // Guest: do not log error, just clear user state
          setProfile({});
          setFavorites([]);
          setHistory([]);
        } else {
          setProfile({});
          setFavorites([]);
          setHistory([]);
        }
      } catch (e) {
        setProfile({});
        setFavorites([]);
        setHistory([]);
      }
    }
    loadProfileAndData();
  }, []);

  // On successful login, set localStorage flag
  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wodIsLoggedIn', '1');
      window.location.reload();
    }
  };

  // Fetch global WODs generated count on mount
  useEffect(() => {
    fetch('/api/global-stats/wods-generated')
      .then(res => res.json())
      .then(data => setGlobalWodsGenerated(data.wodsGenerated || 0));
  }, []);

  // Register service worker for PWA support
  useEffect(() => {
    if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service worker registered:', reg))
        .catch(err => console.warn('Service worker registration failed:', err));
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      // Call API to clear HTTP-only cookie
      fetch('/api/logout', { method: 'POST' }).then(() => {
        localStorage.removeItem("wodProfile");
        localStorage.removeItem('wodIsLoggedIn');
        window.location.reload();
      });
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

  const ensureWodInDb = async (wod) => {
    if (wod?.id) return wod.id;
    // Try to find by name (avoid duplicates)
    const res = await fetch(`/api/admin/workouts`);
    const allWods = await res.json();
    const found = allWods.find(w => w.name === wod.name);
    if (found) {
      // Check if details match; if so, reuse, else create with unique name
      const detailsMatch =
        found.format === (wod.type || wod.format || 'For Time') &&
        found.description === (wod.description || '') &&
        JSON.stringify(found.exercises) === JSON.stringify(Array.isArray(wod.exercises) ? wod.exercises : []) &&
        JSON.stringify(found.equipment) === JSON.stringify(Array.isArray(wod.equipment) ? wod.equipment : []);
      if (detailsMatch) return found.id;
      // Otherwise, append a unique suffix to name
      wod.name = `${wod.name} (${Date.now().toString().slice(-6)})`;
    }
    // Otherwise, create it
    try {
      let createRes = await fetch(`/api/admin/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wod.name || 'Untitled WOD',
          format: wod.type || wod.format || 'For Time',
          description: wod.description || '',
          exercises: Array.isArray(wod.exercises) ? wod.exercises : [],
          equipment: Array.isArray(wod.equipment) ? wod.equipment : [],
        })
      });
      let created = await createRes.json();
      if (!createRes.ok && created.error && created.error.includes('Unique constraint failed')) {
        // Retry with a unique name
        const uniqueName = `${wod.name} (${Date.now().toString().slice(-6)})`;
        createRes = await fetch(`/api/admin/workouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: uniqueName,
            format: wod.type || wod.format || 'For Time',
            description: wod.description || '',
            exercises: Array.isArray(wod.exercises) ? wod.exercises : [],
            equipment: Array.isArray(wod.equipment) ? wod.equipment : [],
          })
        });
        created = await createRes.json();
      }
      if (!createRes.ok) {
        console.error('Failed to create WOD in DB:', created, wod);
        alert('Failed to create WOD: ' + (created.error || createRes.status));
        return null;
      }
      return created.id;
    } catch (err) {
      console.error('Error creating WOD:', err);
      alert('Error creating WOD: ' + (err.message || err.toString()));
      return null;
    }
  };

  // Only allow saving favorites/history if logged in
  const handleFavorite = async (workout) => {
    if (!profile?.id) {
      // Guests can use generator, but cannot save favorites
      return;
    }
    console.log('handleFavorite called with:', { profile, workout, profileId: profile?.id, wod: workout?.wod });
    if (profile?.id && workout?.wod) {
      const wodId = await ensureWodInDb(workout.wod);
      if (!wodId) {
        alert('Could not save WOD to database.');
        return;
      }
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, wodId })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Failed to save favorite: ' + (err.error || res.status));
        return;
      }
      // Refresh favorites
      const favRes = await fetch(`/api/user/favorites?userId=${profile.id}`);
      setFavorites(await favRes.json());
    } else {
      // Only show/log error for logged-in users (should not happen)
      if (profile?.id) {
        alert('Missing user or workout info.');
        console.error('Missing user or workout info:', { profile, workout, profileId: profile?.id, wod: workout?.wod });
      }
      // For guests, do nothing (no alert, no log)
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
    console.log('handleAddToHistory called with:', { profile, workout, profileId: profile?.id, wod: workout?.wod });
    if (profile?.id && workout?.wod) {
      const wodId = await ensureWodInDb(workout.wod);
      if (!wodId) {
        alert('Could not save WOD to database.');
        return;
      }
      const res = await fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, wodId })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Failed to save history: ' + (err.error || res.status));
        return;
      }
      // Refresh history
      const histRes = await fetch(`/api/user/history?userId=${profile.id}`);
      setHistory(await histRes.json());
    } else {
      // Only show/log error for logged-in users (should not happen)
      if (profile?.id) {
        alert('Missing user or workout info.');
        console.error('Missing user or workout info:', { profile, workout, profileId: profile?.id, wod: workout?.wod });
      }
      // For guests, do nothing (no alert, no log)
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans transition-colors duration-200">
      {/* Navigation Tabs */}
      <nav className="bg-black/80 backdrop-blur-md shadow flex flex-col sm:flex-row items-center justify-between px-2 sm:px-6 py-2 sm:py-3 border-b border-white/10 gap-2 sm:gap-0 relative">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <img
            src="/logo.png"
            alt="WOD Shuffler Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded bg-white/10 border border-white/20 object-contain"
            style={{ objectFit: 'contain' }}
          />
          <span className="font-bold text-lg sm:text-xl tracking-tight text-blue-400">WOD Shuffler</span>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden absolute right-4 top-3 z-20 text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
        {/* Nav links - always in flow, use max-h for animation */}
        <div
          className={`w-full sm:w-auto transition-all duration-300 overflow-hidden
            ${menuOpen ? 'max-h-[500px] py-4' : 'max-h-0 py-0'}
            sm:max-h-none sm:py-0 flex flex-col sm:flex-row gap-2 items-center justify-center`}
          style={{ background: menuOpen ? 'rgba(0,0,0,0.95)' : 'transparent', borderBottom: menuOpen ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: menuOpen ? '0 0 1rem 1rem' : '0' }}
        >
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='generator' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => { setActiveTab('generator'); setMenuOpen(false); }}
          >WOD Generator</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='metcon' ? 'bg-green-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => { setActiveTab('metcon'); setMenuOpen(false); }}
          >Metcon Generator</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='favorites' ? 'bg-pink-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => { setActiveTab('favorites'); setMenuOpen(false); }}
          >Favorites</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='history' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => { setActiveTab('history'); setMenuOpen(false); }}
          >History</button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='profile' ? 'bg-gray-600 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => { setActiveTab('profile'); setMenuOpen(false); }}
          >
            {profile?.id ? 'Profile' : 'Login'}
          </button>
          <button
            className={`ml-2 px-3 py-1 rounded ${activeTab==='timer' ? 'bg-blue-800 text-white' : 'bg-white/10 text-white'} text-sm font-semibold transition-colors`}
            onClick={() => { setActiveTab('timer'); setMenuOpen(false); }}
          >Timer</button>
          {profile?.email === ADMIN_EMAIL && (
            <a href="/admin" className="ml-2 px-3 py-1 rounded bg-yellow-500 text-black text-sm font-semibold transition-colors">Admin</a>
          )}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 py-3 mt-3 mb-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md gap-2 sm:gap-0">
        {/* Removed local Generated WODs stat */}
        {profile?.id && (
          <div className="flex flex-col items-center">
            <span className="text-pink-400 font-bold text-2xl">{favorites.length}</span>
            <span className="text-xs text-white/70">Favorites</span>
          </div>
        )}
        {(profile?.id || profile?.email === ADMIN_EMAIL) && (
          <div className="flex flex-col items-center">
            <span className="text-blue-400 font-bold text-2xl">{globalWodsGenerated}</span>
            <span className="text-xs text-white/70">Global WODs Generated</span>
          </div>
        )}
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
            profile?.id ? (
              <FavoritesList
                favorites={favorites}
                onRemove={handleRemoveFavorite}
                onRegenerate={handleRegenerateFavorite}
              />
            ) : (
              <div className="text-center text-pink-400 py-8 font-semibold text-lg">
                Please <a href="https://wodshuffle.vercel.app/auth" className="underline text-blue-400 hover:text-blue-600">sign up or log in</a> to use Favorites!
              </div>
            )
          ) : activeTab === 'history' ? (
            profile?.id ? (
              <HistoryList
                history={history}
                onClear={handleClearHistory}
              />
            ) : (
              <div className="text-center text-blue-400 py-8 font-semibold text-lg">
                Please <a href="https://wodshuffle.vercel.app/auth" className="underline text-pink-400 hover:text-pink-600">sign up or log in</a> to view your History!
              </div>
            )
          ) : activeTab === 'metcon' ? (
            <MetconOnlyGenerator
              intensity={intensity}
              onFavorite={handleFavorite}
              onGenerate={handleAddToHistory}
            />
          ) : activeTab === 'timer' ? (
            <WODTimer />
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
