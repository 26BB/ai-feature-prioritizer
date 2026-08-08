'use client';

import { useState, useEffect } from 'react';
import styles from './PwaInstallPrompt.module.css';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed prompt in the last 7 days
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedTime) {
      const SevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime, 10) < SevenDaysMs) {
        return;
      }
    }

    // 3. Detect iOS platform for custom install guidance
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Display iOS guidance after a short delay
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    // 4. Listen for beforeinstallprompt event on Android/Desktop Chrome/Edge
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser's automatic mini-infobar
      e.preventDefault();
      // Stash event for trigger on click
      setDeferredPrompt(e);
      // Show floating install banner
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      localStorage.setItem('pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }

    // Clear saved prompt & hide banner
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Save dismissal timestamp
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Install Application" className={styles.promptContainer}>
      <div className={styles.promptHeader}>
        <div className={styles.appInfo}>
          <div className={styles.appIconBadge}>◈</div>
          <div className={styles.appMeta}>
            <span className={styles.appTitle}>PriorityAI Dashboard</span>
            <span className={styles.appSubtitle}>Fast • Native • Offline Support</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className={styles.closeBtn}
          aria-label="Close install prompt"
        >
          ✕
        </button>
      </div>

      <p className={styles.promptBody}>
        Install PriorityAI on your desktop or mobile home screen for instant access to AI feature scoring & sprint roadmaps.
      </p>

      <div className={styles.featureList}>
        <span className={styles.featureBadge}>⚡ 1-Click Launch</span>
        <span className={styles.featureBadge}>📱 Standalone UI</span>
        <span className={styles.featureBadge}>🔒 BYOK Support</span>
      </div>

      {isIos ? (
        <div className={styles.iosHint}>
          <span>💡 To install on iOS: Tap the <strong>Share</strong> button (bottom bar) then select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
        </div>
      ) : (
        <div className={styles.actions} style={{ marginTop: '14px' }}>
          <button onClick={handleInstallClick} className={styles.installBtn}>
            📱 Install App
          </button>
          <button onClick={handleDismiss} className={styles.dismissBtn}>
            Not Now
          </button>
        </div>
      )}
    </aside>
  );
}
