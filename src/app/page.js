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
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const user = await res.json();
          setProfile(user);
          // Fetch favorites and history from API
          const favRes = await fetch(`/api/user/favorites?userId=${user.id}`);
          setFavorites(await favRes.json());
          const histRes = await fetch(`/api/user/history?userId=${user.id}`);
          setHistory(await histRes.json());
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
      if (!createRes.ok && typeof created.error === 'string' && created.error.includes('Unique constraint failed')) {
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

  const handleFavorite = async (workout) => {
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
    } else if (workout?.wod) {
      // Guest: save to localStorage
      const favs = getLocalFavorites();
      // Avoid duplicates by name/type/desc
      if (!favs.some(f => f.wod.name === workout.wod.name && f.wod.type === workout.wod.type && f.wod.description === workout.wod.description)) {
        favs.unshift(workout);
        setLocalFavorites(favs);
        setFavorites(favs);
      }
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
    } else if (workout?.wod) {
      // Guest: save to localStorage
      const hist = getLocalHistory();
      hist.unshift({ ...workout, generatedAt: new Date().toISOString() });
      setLocalHistory(hist);
      setHistory(hist);
    } else {
      alert('Missing user or workout info.');
      console.error('Missing user or workout info:', { profile, workout, profileId: profile?.id, wod: workout?.wod });
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

  // LocalStorage helpers for guest users
  const getLocalFavorites = () => JSON.parse(localStorage.getItem('wodFavorites') || '[]');
  const setLocalFavorites = (favs) => localStorage.setItem('wodFavorites', JSON.stringify(favs));
  const getLocalHistory = () => JSON.parse(localStorage.getItem('wodHistory') || '[]');
  const setLocalHistory = (hist) => localStorage.setItem('wodHistory', JSON.stringify(hist));

  // On mount, load local favorites/history for guests
  useEffect(() => {
    if (!profile?.id) {
      setFavorites(getLocalFavorites());
      setHistory(getLocalHistory());
    }
  }, [profile?.id]);

  // On login, merge local favorites/history into DB, then clear localStorage
  useEffect(() => {
    if (profile?.id) {
      const localFavs = getLocalFavorites();
      const localHist = getLocalHistory();
      // Merge favorites
      localFavs.forEach(async (w) => {
        const wodId = await ensureWodInDb(w.wod);
        if (wodId) {
          await fetch('/api/user/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profile.id, wodId })
          });
        }
      });
      // Merge history
      localHist.forEach(async (w) => {
        const wodId = await ensureWodInDb(w.wod);
        if (wodId) {
          await fetch('/api/user/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profile.id, wodId })
          });
        }
      });
      localStorage.removeItem('wodFavorites');
      localStorage.removeItem('wodHistory');
    }
  }, [profile?.id]);

  return (
    <div className={`min-h-screen p-4 ${theme}`}>
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="WOD Shuffler Logo" width={40} height={40} className="h-10 w-10 rounded bg-white/10 border border-white/20 object-contain" />
          <span className="text-2xl font-bold">WOD Shuffler</span>
        </div>
        <nav className="flex gap-2">
          <button className={`px-3 py-1 rounded ${activeTab==='generator' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setActiveTab('generator')}>WOD Generator</button>
          <button className={`px-3 py-1 rounded ${activeTab==='metcon' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setActiveTab('metcon')}>Metcon Generator</button>
          <button className={`px-3 py-1 rounded ${activeTab==='favorites' ? 'bg-pink-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setActiveTab('favorites')}>Favorites</button>
          <button className={`px-3 py-1 rounded ${activeTab==='history' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setActiveTab('history')}>History</button>
          <button className={`px-3 py-1 rounded ${activeTab==='profile' ? 'bg-gray-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`px-3 py-1 rounded ${activeTab==='timer' ? 'bg-blue-800 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setActiveTab('timer')}>Timer</button>
          {profile?.email === ADMIN_EMAIL && (
            <a href="/admin" className="px-3 py-1 rounded bg-yellow-500 text-black">Admin</a>
          )}
        </nav>
        <div className="flex items-center">
          <button onClick={toggleTheme} className="mr-4 p-2 rounded bg-gray-200 dark:bg-gray-700">
            {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          <button onClick={handleLogout} className="p-2 rounded bg-red-500 text-white">
            Logout
          </button>
        </div>
      </header>
      <main>
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <BodyPartSelector selectedBodyParts={bodyParts} onChange={setBodyParts} />
            </div>
            <div className="col-span-1">
              <EquipmentSelector selectedEquipment={equipment} onChange={setEquipment} />
            </div>
            <div className="col-span-1">
              <h2 className="text-xl font-semibold mb-2 text-center">Intensity Level</h2>
              <div className="flex gap-2 justify-center mb-4">
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
            </div>
          </div>
        )}
        {activeTab === 'metcon' && (
          <MetconOnlyGenerator
            intensity={intensity}
            onFavorite={handleFavorite}
            onGenerate={handleAddToHistory}
          />
        )}
        {activeTab === 'favorites' && (
          <FavoritesList
            favorites={favorites}
            onRemove={handleRemoveFavorite}
            onRegenerate={handleRegenerateFavorite}
          />
        )}
        {activeTab === 'history' && (
          <HistoryList
            history={history}
            onRemove={handleClearHistory}
          />
        )}
        {activeTab === 'profile' && (
          <UserProfile profile={profile} />
        )}
        {activeTab === 'timer' && (
          <WODTimer />
        )}
      </main>
      <footer className="mt-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} WOD Generator. All rights reserved.
      </footer>
    </div>
  );
}
