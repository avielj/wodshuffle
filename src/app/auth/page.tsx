'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupGender, setSignupGender] = useState('');
  const [signupAge, setSignupAge] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      alert('Login successful!');
      setLoginEmail('');
      setLoginPassword('');
      // Store user profile
      if (typeof window !== 'undefined') {
        localStorage.setItem('wodProfile', JSON.stringify({ email: loginEmail }));
        // Load user-specific favorites/history
        const favs = JSON.parse(localStorage.getItem(`wodFavorites_${loginEmail}`) || '[]');
        const hist = JSON.parse(localStorage.getItem(`wodHistory_${loginEmail}`) || '[]');
        localStorage.setItem('wodFavorites', JSON.stringify(favs));
        localStorage.setItem('wodHistory', JSON.stringify(hist));
      }
      router.push('/');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('');
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName,
          nickname: signupNickname,
          gender: signupGender,
          age: signupAge,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Sign up failed');
      alert('Sign up successful! Please log in.');
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setSignupNickname('');
      setSignupGender('');
      setSignupAge('');
      setActiveTab('login');
    } catch (err: any) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="glassy bg-black/60 backdrop-blur p-6 rounded-lg shadow border border-white/10 max-w-md mx-auto mt-10">
      <div className="flex mb-6 border-b border-white/10">
        <button
          className={`flex-1 py-2 text-lg font-semibold transition-colors ${activeTab === 'login' ? 'border-b-2 border-blue-400 text-blue-300' : 'text-gray-300'}`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 text-lg font-semibold transition-colors ${activeTab === 'signup' ? 'border-b-2 border-blue-400 text-blue-300' : 'text-gray-300'}`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>
      {activeTab === 'login' ? (
        <form onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
          {loginError && <p className="text-red-400 mb-4">{loginError}</p>}
          <div className="mb-4">
            <label htmlFor="loginEmail" className="block text-gray-200 mb-2">Email</label>
            <input
              type="email"
              id="loginEmail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="loginPassword" className="block text-gray-200 mb-2">Password</label>
            <input
              type="password"
              id="loginPassword"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={loginLoading}
          >
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign Up</h2>
          {signupError && <p className="text-red-400 mb-4">{signupError}</p>}
          <div className="mb-4">
            <label htmlFor="signupName" className="block text-gray-200 mb-2">Name</label>
            <input
              type="text"
              id="signupName"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="signupNickname" className="block text-gray-200 mb-2">Nickname</label>
            <input
              type="text"
              id="signupNickname"
              value={signupNickname}
              onChange={(e) => setSignupNickname(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="signupGender" className="block text-gray-200 mb-2">Gender</label>
            <select
              id="signupGender"
              value={signupGender}
              onChange={(e) => setSignupGender(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="signupAge" className="block text-gray-200 mb-2">Age</label>
            <input
              type="number"
              id="signupAge"
              value={signupAge}
              onChange={(e) => setSignupAge(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="signupEmail" className="block text-gray-200 mb-2">Email</label>
            <input
              type="email"
              id="signupEmail"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="signupPassword" className="block text-gray-200 mb-2">Password</label>
            <input
              type="password"
              id="signupPassword"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full p-2 border rounded bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={signupLoading}
          >
            {signupLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
}
