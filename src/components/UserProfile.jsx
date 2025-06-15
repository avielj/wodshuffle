import React, { useState } from "react";
import Link from 'next/link';

export default function UserProfile({ profile, onSave }) {
  const [name, setName] = useState(profile?.name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [age, setAge] = useState(profile?.age || "");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const isLoggedIn = Boolean(profile?.email);

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg("");
    // For demo: just call reset-password with token=null and email
    const res = await fetch("/api/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, admin: true })
    });
    const data = await res.json();
    if (data.message) setPasswordMsg("Password changed successfully.");
    else setPasswordMsg(data.error || "Error changing password");
    setOldPassword("");
    setNewPassword("");
  }

  return (
    <div className="glassy p-2 sm:p-4 rounded-lg shadow fade-in border border-white/10 max-w-xs mx-auto mt-4">
      <h3 className="font-bold text-base sm:text-lg mb-2">User Profile</h3>
      {!isLoggedIn && (
        <div className="flex gap-4 mb-4">
          <Link href="/auth" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Log In / Sign Up</Link>
        </div>
      )}
      {isLoggedIn && (
        <>
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
          <input
            type="email"
            placeholder="Email (read-only)"
            value={email}
            readOnly
            className="w-full rounded bg-white/10 text-white px-2 py-1 mb-2 text-sm opacity-70 cursor-not-allowed"
          />
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full rounded bg-white/10 text-white px-2 py-1 mb-2 text-sm"
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={e => setAge(e.target.value)}
            className="w-full rounded bg-white/10 text-white px-2 py-1 mb-2 text-sm"
          />
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-2 rounded-md font-semibold transition-colors min-h-[44px] mb-2"
            onClick={() => onSave({ name, avatar, email, nickname, age })}
          >Save Profile</button>
          <button
            className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 px-2 rounded-md font-semibold transition-colors min-h-[44px] mb-2"
            onClick={() => setShowPasswordForm(v => !v)}
          >{showPasswordForm ? "Cancel Password Change" : "Change Password"}</button>
          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-2 mt-2">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded bg-white/10 text-white px-2 py-1 text-sm"
                required
              />
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-2 rounded-md font-semibold transition-colors min-h-[44px]">Update Password</button>
              {passwordMsg && <div className="text-xs text-yellow-200 mt-1">{passwordMsg}</div>}
            </form>
          )}
        </>
      )}
    </div>
  );
}
