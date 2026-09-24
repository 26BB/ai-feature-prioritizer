'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { isDemoMode, signInWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginTabRef = useRef(null);
  const signupTabRef = useRef(null);

  const handleTabKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextMode = mode === 'login' ? 'signup' : 'login';
      setMode(nextMode);
      if (nextMode === 'login') {
        loginTabRef.current?.focus();
      } else {
        signupTabRef.current?.focus();
      }
    }
  };

  // Reset state when modal opens or mode changes & add Escape key listener
  useEffect(() => {
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setDisplayName('');

    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, onClose]);

  if (!isOpen) return null;

  async function handleGoogleSignIn() {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, displayName);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No account found with this email.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists.';
      }
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close authentication modal"
          title="Close authentication modal"
        >
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.badge}>◈ PriorityAI Auth</div>
          <h2 id="auth-modal-title" className={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to access saved feature prioritizations'
              : 'Save and track your RICE roadmaps over time'}
          </p>
        </div>

        {isDemoMode && (
          <div className={styles.demoBanner}>
            <span>⚡ Demo Mode: Firebase unconfigured — instant mock auth enabled.</span>
          </div>
        )}

        {/* Google 1-Click Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className={styles.googleBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className={styles.divider}>
          <span>or email</span>
        </div>

        {/* Mode Tabs */}
        <div className={styles.tabBar} role="tablist" aria-label="Authentication mode">
          <button
            ref={loginTabRef}
            id="auth-tab-login"
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            aria-controls="auth-form"
            tabIndex={mode === 'login' ? 0 : -1}
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => setMode('login')}
            onKeyDown={handleTabKeyDown}
          >
            Sign In
          </button>
          <button
            ref={signupTabRef}
            id="auth-tab-signup"
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            aria-controls="auth-form"
            tabIndex={mode === 'signup' ? 0 : -1}
            className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
            onClick={() => setMode('signup')}
            onKeyDown={handleTabKeyDown}
          >
            Sign Up
          </button>
        </div>

        {/* Email / Password Form */}
        <form id="auth-form" onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.fieldGroup}>
              <label htmlFor="auth-name" className={styles.label}>
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                className="input-field"
                placeholder="Alex Rivera"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label htmlFor="auth-email" className={styles.label}>
              Email Address *
            </label>
            <input
              id="auth-email"
              type="email"
              required
              className="input-field"
              placeholder="pm@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="auth-password" className={styles.label}>
              Password *
            </label>
            <input
              id="auth-password"
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && <div className={styles.errorBanner}>⚠ {errorMsg}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary ${styles.submitBtn}`}
          >
            {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}
