'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const AuthContext = createContext({
  user: null,
  loading: true,
  isDemoMode: true,
  signInWithGoogle: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: async () => {},
  saveSessionToHistory: async () => {},
  getUserHistory: async () => {},
  deleteHistoryItem: async () => {},
});

/** Simple string hash for mock user UID generation */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  // Listen to Auth changes in Real Firebase or load from LocalStorage in Mock mode
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'PM User',
            photoURL: currentUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock mode fallback
      if (typeof window !== 'undefined') {
        const storedMockUser = localStorage.getItem('priority_mock_user');
        if (storedMockUser) {
          try {
            setUser(JSON.parse(storedMockUser));
          } catch {
            localStorage.removeItem('priority_mock_user');
          }
        }
      }
      setLoading(false);
    }
  }, []);

  // ─── Auth Methods (Bolt optimization: memoized callbacks prevent unnecessary re-renders) ───

  const signInWithGoogle = useCallback(async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const formatted = {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName || u.email?.split('@')[0],
        photoURL: u.photoURL,
      };
      setUser(formatted);
      return formatted;
    } else {
      // Demo Google login
      const mockUser = {
        uid: 'demo_google_user_' + Date.now().toString(36),
        email: 'alex.rivera@growthpm.ai',
        displayName: 'Alex Rivera (Demo)',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        providerId: 'google.com',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('priority_mock_user', JSON.stringify(mockUser));
      }
      setUser(mockUser);
      return mockUser;
    }
  }, []);

  // Security: Input validation & sanitization helper for user email and displayName
  const validateAuthInputs = (email, displayName) => {
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    if (!cleanEmail || cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (displayName && (typeof displayName !== 'string' || displayName.trim().length > 100)) {
      throw new Error('Display name must not exceed 100 characters.');
    }
    return cleanEmail;
  };

  const loginWithEmail = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }
    const cleanEmail = validateAuthInputs(email);

    if (isFirebaseConfigured && auth) {
      const creds = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const u = creds.user;
      const formatted = {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName || u.email?.split('@')[0],
        photoURL: u.photoURL,
      };
      setUser(formatted);
      return formatted;
    } else {
      // Demo Email login
      const mockUser = {
        uid: 'demo_user_' + hashString(cleanEmail),
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        photoURL: null,
        providerId: 'password',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('priority_mock_user', JSON.stringify(mockUser));
      }
      setUser(mockUser);
      return mockUser;
    }
  }, []);

  const signupWithEmail = useCallback(async (email, password, displayName) => {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const cleanEmail = validateAuthInputs(email, displayName);
    const cleanDisplayName = displayName ? displayName.trim() : '';

    if (isFirebaseConfigured && auth) {
      const creds = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const u = creds.user;
      if (cleanDisplayName) {
        try {
          await updateProfile(u, { displayName: cleanDisplayName });
        } catch {
          // ignore profile update error
        }
      }
      const formatted = {
        uid: u.uid,
        email: u.email,
        displayName: cleanDisplayName || u.displayName || u.email?.split('@')[0],
        photoURL: u.photoURL,
      };
      setUser(formatted);
      return formatted;
    } else {
      // Demo Email signup
      const mockUser = {
        uid: 'demo_user_' + hashString(cleanEmail),
        email: cleanEmail,
        displayName: cleanDisplayName || cleanEmail.split('@')[0],
        photoURL: null,
        providerId: 'password',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('priority_mock_user', JSON.stringify(mockUser));
      }
      setUser(mockUser);
      return mockUser;
    }
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('priority_mock_user');
      }
    }
    setUser(null);
  }, []);

  // ─── Database History Methods (Bolt optimization: memoized callbacks prevent redundant history fetches) ───

  const saveSessionToHistory = useCallback(async (rawSession) => {
    if (!user) {
      throw new Error('You must be logged in to save prioritization history.');
    }

    // Security: Validate and sanitize session input to prevent mass assignment & document size DoS (CWE-20/CWE-400)
    const session = rawSession && typeof rawSession === 'object' ? rawSession : {};
    const rawFeatures = Array.isArray(session.features) ? session.features.slice(0, 10) : [];
    const features = rawFeatures.map((f) => {
      const item = f && typeof f === 'object' ? f : {};
      return {
        name: String(item.name || 'Untitled Feature').slice(0, 200).trim(),
        reach: Number.isFinite(Number(item.reach)) ? Math.max(1, Math.min(10, Number(item.reach))) : 5,
        impact: Number.isFinite(Number(item.impact)) ? Math.max(1, Math.min(10, Number(item.impact))) : 5,
        confidence: Number.isFinite(Number(item.confidence)) ? Math.max(10, Math.min(100, Number(item.confidence))) : 80,
        effort: Number.isFinite(Number(item.effort)) ? Math.max(1, Math.min(10, Number(item.effort))) : 3,
        rice_score: Number.isFinite(Number(item.rice_score)) ? Number(item.rice_score) : 0,
        sprint: String(item.sprint || 'LATER').slice(0, 10).toUpperCase(),
        reasoning: String(item.reasoning || '').slice(0, 1000).trim(),
        risks: Array.isArray(item.risks) ? item.risks.slice(0, 5).map((r) => String(r).slice(0, 200).trim()).filter(Boolean) : [],
        category: String(item.category || 'Other').slice(0, 100).trim(),
      };
    });

    const defaultTitle = features[0]?.name
      ? `${features[0].name}${features.length > 1 ? ` +${features.length - 1} more` : ''}`
      : 'Feature Prioritization';
    const title = String(session.title || defaultTitle).slice(0, 200).trim();
    const topFeature = features[0]?.name || 'N/A';
    const topRice = features[0]?.rice_score || 0;
    const model = String(session.model || 'meta/llama-3.3-70b-instruct').slice(0, 100).trim();

    if (isFirebaseConfigured && db) {
      const historyCol = collection(db, 'users', user.uid, 'history');
      const docRef = await addDoc(historyCol, {
        title,
        features,
        featureCount: features.length,
        topFeature,
        topRice,
        model,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } else {
      // Demo Firestore mock
      const mockHistory = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('priority_history_mock') || '[]') : [];
      const newItem = {
        id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: user.uid,
        title,
        features,
        featureCount: features.length,
        topFeature,
        topRice,
        model,
        createdAt: new Date().toISOString(),
      };
      mockHistory.unshift(newItem);
      if (typeof window !== 'undefined') {
        localStorage.setItem('priority_history_mock', JSON.stringify(mockHistory));
      }
      return newItem.id;
    }
  }, [user]);

  const getUserHistory = useCallback(async () => {
    if (!user) return [];

    if (isFirebaseConfigured && db) {
      try {
        const historyCol = collection(db, 'users', user.uid, 'history');
        const q = query(historyCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          };
        });
      } catch (err) {
        console.error('[PriorityAI Firestore] Failed to fetch user history:', err);
        return [];
      }
    } else {
      // Demo Firestore mock
      if (typeof window === 'undefined') return [];
      const mockHistory = JSON.parse(localStorage.getItem('priority_history_mock') || '[]');
      return mockHistory.filter((item) => item.userId === user.uid);
    }
  }, [user]);

  const deleteHistoryItem = useCallback(async (id) => {
    if (!user) return;

    // Security: Validate history document ID to prevent Firestore path traversal attacks (CWE-22 / CWE-352)
    if (typeof id !== 'string' || !id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      console.warn('[PriorityAI Auth] Invalid or potentially malicious history document ID rejected:', id);
      return;
    }

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'users', user.uid, 'history', id);
      await deleteDoc(docRef);
    } else {
      if (typeof window !== 'undefined') {
        const mockHistory = JSON.parse(localStorage.getItem('priority_history_mock') || '[]');
        const filtered = mockHistory.filter((item) => item.id !== id);
        localStorage.setItem('priority_history_mock', JSON.stringify(filtered));
      }
    }
  }, [user]);

  // Bolt optimization: Memoize context value to prevent unnecessary re-renders of all context consumers on parent state updates
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      isDemoMode,
      signInWithGoogle,
      loginWithEmail,
      signupWithEmail,
      logout,
      saveSessionToHistory,
      getUserHistory,
      deleteHistoryItem,
    }),
    [
      user,
      loading,
      isDemoMode,
      signInWithGoogle,
      loginWithEmail,
      signupWithEmail,
      logout,
      saveSessionToHistory,
      getUserHistory,
      deleteHistoryItem,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
