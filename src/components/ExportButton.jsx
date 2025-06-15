import React from "react";

export default function ExportButton({ targetId }) {
  const handleExport = async () => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(targetId);
    if (!el) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(el);
    const link = document.createElement("a");
    link.download = "wod.png";
    link.href = canvas.toDataURL();
    link.click();
  };
  return (
    <button
      onClick={handleExport}
      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-semibold shadow"
      title="Export as image"
    >🖼 Export</button>
  );
}
