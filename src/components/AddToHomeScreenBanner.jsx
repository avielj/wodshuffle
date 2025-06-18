'use client';

import React, { useState, useEffect } from "react";

export default function AddToHomeScreenBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("addToHomeScreenDismissed");
      if (!dismissed) setVisible(true);
      // Listen for beforeinstallprompt (Android/Chrome)
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowAdd(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      // iOS: show add button if in Safari and not in standalone
      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        const isInStandalone = window.navigator.standalone === true;
        if (!isInStandalone) setShowAdd(true);
      }
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("addToHomeScreenDismissed", "1");
    }
  };

  const handleAddToHome = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => setDeferredPrompt(null));
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      alert('To add WOD Shuffler to your home screen, tap the Share button in Safari and choose "Add to Home Screen".');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center">
      <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg shadow-lg flex items-center gap-4 animate-fade-in">
        <span className="font-medium">Add WOD Shuffler to your home screen for quick access!</span>
        {showAdd && (
          <button
            className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold transition"
            onClick={handleAddToHome}
          >
            Add to Home
          </button>
        )}
        <button
          className="ml-2 px-3 py-1 rounded bg-blue-800 hover:bg-blue-900 text-white font-bold transition"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
