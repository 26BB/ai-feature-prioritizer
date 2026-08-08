'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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

  // ─── Auth Methods ─────────────────────────────────────────────────────────

  async function signInWithGoogle() {
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
  }

  async function loginWithEmail(email, password) {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }

    if (isFirebaseConfigured && auth) {
      const creds = await signInWithEmailAndPassword(auth, email, password);
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
        uid: 'demo_user_' + hashString(email),
        email,
        displayName: email.split('@')[0],
        photoURL: null,
        providerId: 'password',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('priority_mock_user', JSON.stringify(mockUser));
      }
      setUser(mockUser);
      return mockUser;
    }
  }

  async function signupWithEmail(email, password, displayName) {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (isFirebaseConfigured && auth) {
      const creds = await createUserWithEmailAndPassword(auth, email, password);
      const u = creds.user;
      if (displayName) {
        try {
          await updateProfile(u, { displayName });
        } catch {
          // ignore profile update error
        }
      }
      const formatted = {
        uid: u.uid,
        email: u.email,
        displayName: displayName || u.displayName || u.email?.split('@')[0],
        photoURL: u.photoURL,
      };
      setUser(formatted);
      return formatted;
    } else {
      // Demo Email signup
      const mockUser = {
        uid: 'demo_user_' + hashString(email),
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        providerId: 'password',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('priority_mock_user', JSON.stringify(mockUser));
      }
      setUser(mockUser);
      return mockUser;
    }
  }

  async function logout() {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('priority_mock_user');
      }
    }
    setUser(null);
  }

  // ─── Database History Methods ─────────────────────────────────────────────

  async function saveSessionToHistory(sessionData) {
    if (!user) {
      throw new Error('You must be logged in to save prioritization history.');
    }

    const title =
      sessionData.title ||
      (sessionData.features?.[0]?.name
        ? `${sessionData.features[0].name}${sessionData.features.length > 1 ? ` +${sessionData.features.length - 1} more` : ''}`
        : 'Feature Prioritization');

    const topFeature = sessionData.features?.[0]?.name || 'N/A';
    const topRice = sessionData.features?.[0]?.rice_score || 0;

    if (isFirebaseConfigured && db) {
      const historyCol = collection(db, 'users', user.uid, 'history');
      const docRef = await addDoc(historyCol, {
        title,
        features: sessionData.features || [],
        featureCount: sessionData.features?.length || 0,
        topFeature,
        topRice,
        model: sessionData.model || 'meta/llama-3.3-70b-instruct',
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
        features: sessionData.features || [],
        featureCount: sessionData.features?.length || 0,
        topFeature,
        topRice,
        model: sessionData.model || 'meta/llama-3.3-70b-instruct',
        createdAt: new Date().toISOString(),
      };
      mockHistory.unshift(newItem);
      if (typeof window !== 'undefined') {
        localStorage.setItem('priority_history_mock', JSON.stringify(mockHistory));
      }
      return newItem.id;
    }
  }

  async function getUserHistory() {
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
  }

  async function deleteHistoryItem(id) {
    if (!user) return;

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
  }

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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
