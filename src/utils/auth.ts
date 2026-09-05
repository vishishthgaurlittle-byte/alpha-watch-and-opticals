import { auth, googleProvider } from '../lib/insforge';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  InsForgeUser
} from '@insforge/auth';

export const signInWithGoogle = async (): Promise<{ success: boolean; user?: InsForgeUser; error?: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'Customer'),
        email: user.email,
        photoURL: user.photoURL,
        provider: 'google'
      })
    });

    console.log('User signed in:', user.displayName || user.email);
    return { success: true, user };
  } catch (error: any) {
    console.error('Google sign-in failed:', error);
    return { success: false, error: error?.message || 'Google sign-in failed' };
  }
};

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        name: name || email.split('@')[0],
        email,
        photoURL: null,
        provider: 'password'
      })
    });

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Registration failed' };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Login failed' };
  }
};
