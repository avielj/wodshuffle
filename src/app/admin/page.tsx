"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "avielj@gmail.com";

export default function AdminPanel() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tab, setTab] = useState("muscleGroups");
  const router = useRouter();

  useEffect(() => {
    // Load email from localStorage profile
    let email = null;
    if (typeof window !== "undefined") {
      const profile = JSON.parse(localStorage.getItem("wodProfile") || "{}");
      email = profile.email || null;
      setUserEmail(email);
      if (email !== ADMIN_EMAIL) {
        router.replace("/");
      }
    }
  }, [router]);

  if (userEmail !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition">Back to Home</button>
      </div>
      <div className="flex space-x-4 mb-8">
        <button onClick={() => setTab("muscleGroups")} className={`px-4 py-2 rounded ${tab === "muscleGroups" ? "bg-white text-black" : "bg-gray-700"}`}>Muscle Groups</button>
        <button onClick={() => setTab("metcons")} className={`px-4 py-2 rounded ${tab === "metcons" ? "bg-white text-black" : "bg-gray-700"}`}>Metcons</button>
        <button onClick={() => setTab("warmups")} className={`px-4 py-2 rounded ${tab === "warmups" ? "bg-white text-black" : "bg-gray-700"}`}>Warmups</button>
        <button onClick={() => setTab("users")} className={`px-4 py-2 rounded ${tab === "users" ? "bg-white text-black" : "bg-gray-700"}`}>Users</button>
      </div>
      <div>
        {tab === "muscleGroups" && <MuscleGroupsAdmin />}
        {tab === "metcons" && <MetconsAdmin />}
        {tab === "warmups" && <WarmupsAdmin />}
        {tab === "users" && <UsersAdmin />}
      </div>
    </div>
  );
}

function MuscleGroupsAdmin() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", bodyParts: "[]", equipment: "[]", progression: "", demo: "" });

  useEffect(() => { fetchExercises(); }, []);
  async function fetchExercises() {
    setLoading(true);
    const res = await fetch("/api/admin/strength");
    const data = await res.json();
    setExercises(data);
    setLoading(false);
  }
  async function handleSubmit(e: any) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/strength/${editing.id}` : "/api/admin/strength";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        bodyParts: JSON.parse(form.bodyParts),
        equipment: JSON.parse(form.equipment),
        type: 'strength',
      }),
    });
    setForm({ name: "", bodyParts: "[]", equipment: "[]", progression: "", demo: "" });
    setEditing(null);
    fetchExercises();
  }
  function handleEdit(ex: any) {
    setEditing(ex);
    setForm({
      name: ex.name,
      bodyParts: JSON.stringify(ex.bodyParts),
      equipment: JSON.stringify(ex.equipment),
      progression: ex.progression || "",
      demo: ex.demo || "",
    });
  }
  async function handleDelete(id: string) {
    await fetch(`/api/admin/strength/${id}`, { method: "DELETE" });
    fetchExercises();
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Muscle Groups (Strength Exercises)</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 bg-gray-800 p-4 rounded">
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Body Parts (JSON)" value={form.bodyParts} onChange={e => setForm(f => ({ ...f, bodyParts: e.target.value }))} required />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Equipment (JSON)" value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Progression" value={form.progression} onChange={e => setForm(f => ({ ...f, progression: e.target.value }))} />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Demo URL" value={form.demo} onChange={e => setForm(f => ({ ...f, demo: e.target.value }))} />
        <button type="submit" className="bg-blue-500 px-4 py-2 rounded text-white">{editing ? "Update" : "Add"} Muscle Group</button>
        {editing && <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-600" onClick={() => { setEditing(null); setForm({ name: "", bodyParts: "[]", equipment: "[]", progression: "", demo: "" }); }}>Cancel</button>}
      </form>
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-left bg-gray-900 rounded">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Body Parts</th>
              <th className="p-2">Equipment</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map(ex => (
              <tr key={ex.id} className="border-t border-gray-700">
                <td className="p-2">{ex.name}</td>
                <td className="p-2">{JSON.stringify(ex.bodyParts)}</td>
                <td className="p-2">{JSON.stringify(ex.equipment)}</td>
                <td className="p-2">
                  <button className="text-blue-400 mr-2" onClick={() => handleEdit(ex)}>Edit</button>
                  <button className="text-red-400" onClick={() => handleDelete(ex.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function MetconsAdmin() {
  const [metcons, setMetcons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", format: "", description: "", exercises: "[]", equipment: "[]" });

  useEffect(() => { fetchMetcons(); }, []);
  async function fetchMetcons() {
    setLoading(true);
    const res = await fetch("/api/admin/metcons");
    const data = await res.json();
    setMetcons(data);
    setLoading(false);
  }
  async function handleSubmit(e: any) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/metcons/${editing.id}` : "/api/admin/metcons";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        exercises: JSON.parse(form.exercises),
        equipment: JSON.parse(form.equipment),
      }),
    });
    setForm({ name: "", format: "", description: "", exercises: "[]", equipment: "[]" });
    setEditing(null);
    fetchMetcons();
  }
  function handleEdit(metcon: any) {
    setEditing(metcon);
    setForm({
      name: metcon.name,
      format: metcon.format,
      description: metcon.description,
      exercises: JSON.stringify(metcon.exercises),
      equipment: JSON.stringify(metcon.equipment),
    });
  }
  async function handleDelete(id: string) {
    await fetch(`/api/admin/metcons/${id}`, { method: "DELETE" });
    fetchMetcons();
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Metcons</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 bg-gray-800 p-4 rounded">
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Format" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} required />
        <textarea className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Exercises (JSON)" value={form.exercises} onChange={e => setForm(f => ({ ...f, exercises: e.target.value }))} required />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Equipment (JSON)" value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} required />
        <button type="submit" className="bg-blue-500 px-4 py-2 rounded text-white">{editing ? "Update" : "Add"} Metcon</button>
        {editing && <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-600" onClick={() => { setEditing(null); setForm({ name: "", format: "", description: "", exercises: "[]", equipment: "[]" }); }}>Cancel</button>}
      </form>
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-left bg-gray-900 rounded">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Format</th>
              <th className="p-2">Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {metcons.map(metcon => (
              <tr key={metcon.id} className="border-t border-gray-700">
                <td className="p-2">{metcon.name}</td>
                <td className="p-2">{metcon.format}</td>
                <td className="p-2 max-w-xs truncate">{metcon.description}</td>
                <td className="p-2">
                  <button className="text-blue-400 mr-2" onClick={() => handleEdit(metcon)}>Edit</button>
                  <button className="text-red-400" onClick={() => handleDelete(metcon.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function WarmupsAdmin() {
  const [warmups, setWarmups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", bodyParts: "[]", duration: "{}", reps: "{}", equipment: "[]", intensity: "{}", progression: "", demo: "" });

  useEffect(() => { fetchWarmups(); }, []);
  async function fetchWarmups() {
    setLoading(true);
    const res = await fetch("/api/admin/warmups");
    const data = await res.json();
    setWarmups(data);
    setLoading(false);
  }
  async function handleSubmit(e: any) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/warmups/${editing.id}` : "/api/admin/warmups";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        bodyParts: JSON.parse(form.bodyParts),
        duration: JSON.parse(form.duration),
        reps: JSON.parse(form.reps),
        equipment: JSON.parse(form.equipment),
        intensity: JSON.parse(form.intensity),
      }),
    });
    setForm({ name: "", bodyParts: "[]", duration: "{}", reps: "{}", equipment: "[]", intensity: "{}", progression: "", demo: "" });
    setEditing(null);
    fetchWarmups();
  }
  function handleEdit(warmup: any) {
    setEditing(warmup);
    setForm({
      name: warmup.name,
      bodyParts: JSON.stringify(warmup.bodyParts),
      duration: JSON.stringify(warmup.duration),
      reps: JSON.stringify(warmup.reps),
      equipment: JSON.stringify(warmup.equipment),
      intensity: JSON.stringify(warmup.intensity),
      progression: warmup.progression || "",
      demo: warmup.demo || "",
    });
  }
  async function handleDelete(id: string) {
    await fetch(`/api/admin/warmups/${id}`, { method: "DELETE" });
    fetchWarmups();
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Warmups</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 bg-gray-800 p-4 rounded">
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Body Parts (JSON)" value={form.bodyParts} onChange={e => setForm(f => ({ ...f, bodyParts: e.target.value }))} required />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Duration (JSON)" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Reps (JSON)" value={form.reps} onChange={e => setForm(f => ({ ...f, reps: e.target.value }))} />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Equipment (JSON)" value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Intensity (JSON)" value={form.intensity} onChange={e => setForm(f => ({ ...f, intensity: e.target.value }))} />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Progression" value={form.progression} onChange={e => setForm(f => ({ ...f, progression: e.target.value }))} />
        <input className="w-full p-2 rounded bg-gray-900 text-white" placeholder="Demo URL" value={form.demo} onChange={e => setForm(f => ({ ...f, demo: e.target.value }))} />
        <button type="submit" className="bg-blue-500 px-4 py-2 rounded text-white">{editing ? "Update" : "Add"} Warmup</button>
        {editing && <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-600" onClick={() => { setEditing(null); setForm({ name: "", bodyParts: "[]", duration: "{}", reps: "{}", equipment: "[]", intensity: "{}", progression: "", demo: "" }); }}>Cancel</button>}
      </form>
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-left bg-gray-900 rounded">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Body Parts</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warmups.map(warmup => (
              <tr key={warmup.id} className="border-t border-gray-700">
                <td className="p-2">{warmup.name}</td>
                <td className="p-2">{JSON.stringify(warmup.bodyParts)}</td>
                <td className="p-2">
                  <button className="text-blue-400 mr-2" onClick={() => handleEdit(warmup)}>Edit</button>
                  <button className="text-red-400" onClick={() => handleDelete(warmup.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);
  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }
  async function handleDelete(id: string) {
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  }
  async function handleResetPassword(email: string) {
    // Set password to '123456' directly
    const res = await fetch('/api/reset-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: null, email, newPassword: '123456', admin: true })
    });
    const data = await res.json();
    if (data.message) {
      setResetToken('Password reset to 123456 for ' + email);
      setResetUser(email);
    } else {
      setResetToken(data.error || 'Error resetting password');
      setResetUser(email);
    }
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
      {resetToken && resetUser && (
        <div className="mb-4 p-2 bg-yellow-900/60 rounded text-yellow-200">
          Password reset token for <b>{resetUser}</b>: <span className="font-mono break-all">{resetToken}</span>
        </div>
      )}
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-left bg-gray-900 rounded">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Email</th>
              <th className="p-2">Nickname</th>
              <th className="p-2">Age</th>
              <th className="p-2">Created At</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-gray-700">
                <td className="p-2">{user.id}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.nickname || ''}</td>
                <td className="p-2">{user.age || ''}</td>
                <td className="p-2">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <button className="text-blue-400 mr-2" onClick={() => handleResetPassword(user.email)}>Reset Password</button>
                  <button className="text-red-400" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
