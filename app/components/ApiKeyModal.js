'use client';
import { useState, useEffect, useRef, memo } from 'react';
import styles from './ApiKeyModal.module.css';

// Bolt optimization: Memoized ApiKeyModal prevents re-evaluating modal markup and hooks on parent state updates when modal is closed
const ApiKeyModal = memo(function ApiKeyModal({ isOpen, onClose }) {
  const [provider, setProvider] = useState('auto');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  const closeBtnRef = useRef(null);
  const modalCardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement;

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
        return;
      }

      if (e.key === 'Tab' && modalCardRef.current) {
        const focusables = modalCardRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  // Bolt optimization: Single O(N) pass using Object.keys(localStorage) avoids O(N²) index lookup traversals with localStorage.key(i)
  function updateCacheCount() {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage);
    let count = 0;
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('rice_cache_')) {
        count++;
      }
    }
    setCacheCount(count);
  }

  function handleSave() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('priority_byok_provider', provider);
      if (provider === 'auto') {
        localStorage.removeItem('priority_byok_key');
      } else {
        localStorage.setItem('priority_byok_key', apiKey.trim());
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    }
  }

  // Bolt optimization: Direct removal in single O(N) pass avoids intermediate key array allocation & O(N²) key indexing
  function handleClearCache() {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].startsWith('rice_cache_')) {
          localStorage.removeItem(keys[i]);
        }
      }
      // Bolt optimization: Directly set count to 0 instead of running O(N) localStorage scan
      setCacheCount(0);
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
        ref={modalCardRef}
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
              <span className={styles.subtext}>\n                Keys are stored locally in your browser and never saved on our server.\n              </span>
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
});

export default ApiKeyModal;
