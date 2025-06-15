import React, { useState } from "react";

export default function UserProfile({ profile, onSave }) {
  const [name, setName] = useState(profile?.name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  return (
    <div className="glassy p-2 sm:p-4 rounded-lg shadow fade-in border border-white/10 max-w-xs mx-auto mt-4">
      <h3 className="font-bold text-base sm:text-lg mb-2">User Profile</h3>
      <div className="mb-2 flex flex-col items-center">
        <img
          src={avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=CrossFitter"}
          alt="Avatar"
          className="w-16 h-16 rounded-full border mb-2"
        />
        <input
          type="text"
          placeholder="Avatar URL"
          value={avatar}
          onChange={e => setAvatar(e.target.value)}
          className="w-full rounded bg-white/10 text-white px-2 py-1 mb-2 text-sm"
        />
      </div>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full rounded bg-white/10 text-white px-2 py-1 mb-2 text-sm"
      />
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-2 rounded-md font-semibold transition-colors min-h-[44px]"
        onClick={() => onSave({ name, avatar })}
      >Save Profile</button>
    </div>
  );
}
