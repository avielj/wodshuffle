import React, { useState, useEffect } from "react";

export default function AddToHomeScreenBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not dismissed before
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("addToHomeScreenDismissed");
      if (!dismissed) setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("addToHomeScreenDismissed", "1");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center">
      <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg shadow-lg flex items-center gap-4 animate-fade-in">
        <span className="font-medium">Add IronForge WOD to your home screen for quick access!</span>
        <button
          className="ml-4 px-3 py-1 rounded bg-blue-800 hover:bg-blue-900 text-white font-bold transition"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
