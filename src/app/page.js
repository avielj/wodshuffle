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
        <div className="text-2xl font-bold">WOD Generator</div>
        <div className="flex items-center">
          <button onClick={toggleTheme} className="mr-4 p-2 rounded-md bg-gray-200 dark:bg-gray-800">
            {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md bg-gray-200 dark:bg-gray-800">
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-50">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200">Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200">My Workouts</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200">Quick Stats</a>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <a href="#" onClick={handleLogout} className="block px-4 py-2 text-sm text-red-600 dark:text-red-400">Logout</a>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Generate a Workout</h2>
            <BodyPartSelector selectedParts={bodyParts} onSelect={setBodyParts} />
            <EquipmentSelector selectedEquipment={equipment} onSelect={setEquipment} />
            <div className="flex gap-2">
              <button onClick={handleGenerate} className="flex-1 bg-blue-600 text-white p-2 rounded-md shadow-md">
                Generate WOD
              </button>
              <button onClick={handleCollapseReset} className="flex-1 bg-gray-300 dark:bg-gray-700 p-2 rounded-md shadow-md">
                Reset
              </button>
            </div>
            <WorkoutGenerator
              key={workoutKey}
              bodyParts={bodyParts}
              intensity={intensity}
              equipment={equipment}
              onAddToFavorites={handleFavorite}
              onAddToHistory={handleAddToHistory}
              collapsed={collapsed}
              onCollapseReset={handleCollapseReset}
              showMetconOnly={showMetconOnly}
            />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">My Favorites</h2>
            <FavoritesList
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onRegenerate={handleRegenerateFavorite}
              profile={profile}
            />
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Workout History</h2>
          <HistoryList
            history={history}
            onRemove={handleClearHistory}
            profile={profile}
          />
        </div>
      </main>
      <footer className="mt-4 text-center text-gray-500">
        <div>
          &copy; {new Date().getFullYear()} WOD Generator. All rights reserved.
        </div>
        <div>
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> |{" "}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
