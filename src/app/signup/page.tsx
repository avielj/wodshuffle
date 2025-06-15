// This page is deprecated. All authentication is now handled in the Profile page with AuthTabs.
// Redirect to /profile for any direct access.

'use client';
import { useEffect } from 'react';

export default function DeprecatedSignup() {
  useEffect(() => {
    window.location.replace('/profile');
  }, []);
  return null;
}
