import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from '@insforge/auth';
import { auth } from '../lib/insforge';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return { user, loading, logout };
};
