'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './ApiKeyModal.module.css';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [provider, setProvider] = useState('auto');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined') {
      const storedProvider = localStorage.getItem('priority_byok_provider') || 'auto';
      const storedKey = localStorage.getItem('priority_byok_key') || '';
      setProvider(storedProvider);
      setApiKey(storedKey);

      // Count cached items
      updateCacheCount();
    }

    // Set initial focus to close button for keyboard/screen reader accessibility
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  function updateCacheCount() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith('rice_cache_')) {
        count++;
      }
    }
    setCacheCount(count);
  }

  function handleSave() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('priority_byok_provider', provider);
      localStorage.setItem('priority_byok_key', apiKey.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    }
  }

  function handleClearCache() {
    if (typeof window !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('rice_cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      updateCacheCount();
      setCacheClearedSuccess(true);
      setTimeout(() => {
        setCacheClearedSuccess(false);
      }, 1800);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className={styles.header}>
          <h3 id="settings-modal-title">⚙️ Settings & BYOK (Bring Your Own Key)</h3>
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close settings modal"
            title="Close settings modal"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.hint}>
            Avoid API rate limits by configuring your own provider key or using server defaults.
          </p>

          <div className={styles.fieldGroup}>
            <label htmlFor="byok-provider-select">AI Provider</label>
            <select
              id="byok-provider-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className={styles.selectInput}
            >
              <option value="auto">Auto (Server Default / Pooled)</option>
              <option value="gemini">Google Gemini API (Generous Free Tier)</option>
              <option value="openai">OpenAI (gpt-4o-mini)</option>
              <option value="groq">Groq (Ultra-fast Llama 3.3)</option>
              <option value="nvidia">NVIDIA NIM (Llama 3.3 70B)</option>
            </select>
          </div>

          {provider !== 'auto' && (
            <div className={styles.fieldGroup}>
              <label htmlFor="byok-api-key">API Key for {provider.toUpperCase()}</label>
              <div className={styles.keyInputWrapper}>
                <input
                  id="byok-api-key"
                  type={showKey ? 'text' : 'password'}
                  placeholder={`Paste your ${provider.toUpperCase()} key...`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  className={styles.textInput}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className={styles.toggleShowBtn}
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  title={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
              <span className={styles.subtext}>
                Keys are stored locally in your browser and never saved on our server.
              </span>
            </div>
          )}

          <hr className={styles.divider} />

          <div className={styles.cacheSection}>
            <div className={styles.cacheInfo}>
              <span>⚡ Client-Side Response Cache</span>
              <strong>{cacheCount} items cached</strong>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              disabled={cacheCount === 0}
              aria-disabled={cacheCount === 0}
              aria-label="Clear client-side response cache"
              className={styles.clearCacheBtn}
              title={cacheCount === 0 ? 'No cached items to clear' : 'Clear cached response items'}
            >
              Clear Cache
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          {savedSuccess && (
            <span className={styles.savedBadge} role="status" aria-live="polite">
              ✅ Saved!
            </span>
          )}
          {cacheClearedSuccess && (
            <span className={styles.savedBadge} role="status" aria-live="polite">
              ⚡ Cache Cleared!
            </span>
          )}
          <button className={styles.saveBtn} onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
