'use client';
import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../page.module.css';
import ApiKeyModal from '../components/ApiKeyModal';
import AuthModal from '../components/AuthModal';

const CATEGORIES = ['AI/ML', 'Infrastructure', 'UX/Design', 'Growth', 'Analytics', 'Security', 'Other'];

const LOADING_STEPS = [
  'Parsing feature descriptions...',
  'Calculating RICE scores with AI...',
  'Generating sprint roadmap...',
  'Preparing visualizations...',
];

const makeEmptyFeature = () => ({ name: '', description: '', category: 'AI/ML' });

function generateCacheKey(features) {
  const serialized = features
    .map((f) => `${f.name.trim().toLowerCase()}|${(f.description || '').trim().toLowerCase()}|${f.category}`)
    .sort()
    .join('||');
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    const char = serialized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'rice_cache_' + Math.abs(hash).toString(36);
}

// Bolt optimization: Memoized FeatureCard component prevents re-rendering unedited cards on form typing (reduces re-renders by up to 90%)
const FeatureCard = memo(function FeatureCard({
  idx,
  feature,
  canRemove,
  onRemove,
  onUpdate,
}) {
  return (
    <div className={`${styles.featureCard} glass-card`}>
      <div className={styles.cardHeader}>
        <span className={styles.featureNumber}>#{idx + 1}</span>
        {canRemove && (
          <button
            onClick={() => onRemove(idx)}
            className={styles.removeBtn}
            aria-label={`Remove feature ${idx + 1}`}
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor={`name-${idx}`} className={styles.fieldLabel}>Feature Name *</label>
        <input
          id={`name-${idx}`}
          className="input-field"
          placeholder="e.g. AI Auto-complete for search"
          value={feature.name}
          onChange={(e) => onUpdate(idx, 'name', e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor={`desc-${idx}`} className={styles.fieldLabel}>Description</label>
          <span
            id={`desc-count-${idx}`}
            style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}
          >
            {(feature.description || '').length}/500
          </span>
        </div>
        <textarea
          id={`desc-${idx}`}
          className={`input-field ${styles.textarea}`}
          placeholder="What does this feature do? Who benefits? What problem does it solve?"
          value={feature.description}
          onChange={(e) => onUpdate(idx, 'description', e.target.value)}
          rows={3}
          maxLength={500}
          aria-describedby={`desc-count-${idx}`}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor={`cat-${idx}`} className={styles.fieldLabel}>Category</label>
        <select
          id={`cat-${idx}`}
          className="input-field"
          value={feature.category}
          onChange={(e) => onUpdate(idx, 'category', e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
});

export default function AnalyzePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [features, setFeatures] = useState([makeEmptyFeature(), makeEmptyFeature(), makeEmptyFeature()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  function addFeature() {
    if (features.length < 10) setFeatures([...features, makeEmptyFeature()]);
  }

  function handleResetForm() {
    const isDirty = features.some((f) => f.name.trim() || f.description.trim());
    if (isDirty) {
      if (!window.confirm('Are you sure you want to reset the form? All entered features will be cleared.')) {
        return;
      }
    }
    setFeatures([makeEmptyFeature(), makeEmptyFeature(), makeEmptyFeature()]);
    setError('');
  }

  const removeFeature = useCallback((idx) => {
    setFeatures((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }, []);

  const updateFeature = useCallback((idx, field, value) => {
    setFeatures((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  }, []);

  async function handleAnalyze() {
    const valid = features.filter((f) => f.name.trim());

    if (valid.length === 0) {
      setError('Please add at least one feature name.');
      return;
    }

    setError('');

    const cacheKey = generateCacheKey(valid);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          sessionStorage.setItem('priorityResults', JSON.stringify({ ...parsedCache, isCached: true }));
          router.push('/results');
          return;
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    setLoading(true);
    setCurrentStep(0);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= LOADING_STEPS.length) clearInterval(stepTimer);
        return next;
      });
    }, 1200);

    try {
      const userProvider = localStorage.getItem('priority_byok_provider') || 'auto';
      const userApiKey = localStorage.getItem('priority_byok_key') || '';

      const res = await fetch('/api/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider': userProvider,
          'x-api-key': userApiKey,
        },
        body: JSON.stringify({ features: valid }),
      });
      const data = await res.json();
      clearInterval(stepTimer);

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }

      sessionStorage.setItem('priorityResults', JSON.stringify(data));
      router.push('/results');
    } catch {
      clearInterval(stepTimer);
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className="bg-pattern" />
        <div className={`${styles.loadingCard} glass-card-elevated`}>
          <div className={styles.nvidiaIcon}>⚡</div>
          <h2>Analyzing Your Features</h2>
          <p className={styles.loadingSubtitle}>Powered by Multi-Provider AI & Failover Engine</p>

          <div className={styles.steps}>
            {LOADING_STEPS.map((label, i) => (
              <div
                key={label}
                className={`${styles.stepRow} ${i <= currentStep ? styles.stepDone : ''}`}
              >
                <span className={styles.stepIcon}>
                  {i < currentStep ? '✅' : i === currentStep ? '⏳' : '⬜'}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  const filledCount = features.filter((f) => f.name.trim()).length;

  return (
    <div className={styles.page}>
      <div className="bg-pattern" />

      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>PriorityAI</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/analyze" className={`${styles.navLink} ${styles.navActive}`}>Workspace</Link>
          <Link href="/history" className={styles.navLink}>My History</Link>
          <button onClick={() => setIsModalOpen(true)} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ⚙️ Settings & BYOK
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <button
              onClick={() => router.push('/history')}
              className="btn-ghost"
              style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>👤</span>
              <span>{user.displayName || user.email}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-ghost"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              Sign In
            </button>
          )}
          <button
            onClick={handleResetForm}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            + Reset Form
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroBadge}>✦ Powered by NVIDIA, Gemini & Groq AI</div>
        <h1 className={styles.heroTitle}>
          Prioritize Smarter <span className={styles.heroGradient}>with AI</span>
        </h1>
        <p className={styles.heroSub}>
          Input your feature ideas. Get RICE scores, effort vs impact analysis,
          and a sprint roadmap — in seconds.
        </p>
      </header>

      {/* ── Two-column layout ── */}
      <main className={styles.main}>
        <section className={styles.inputSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Features</h2>
            <span className={styles.featureCount}>{filledCount}/{features.length} filled</span>
          </div>

          <div className={styles.featureList}>
            {features.map((feature, idx) => (
              <FeatureCard
                key={idx}
                idx={idx}
                feature={feature}
                canRemove={features.length > 1}
                onRemove={removeFeature}
                onUpdate={updateFeature}
              />
            ))}
          </div>

          <div className={styles.actions}>
            {features.length < 10 && (
              <button onClick={addFeature} className="btn-secondary" style={{ width: '100%' }}>
                + Add Another Feature ({features.length}/10)
              </button>
            )}

            {error && <div className={styles.errorMsg} role="alert">⚠️ {error}</div>}

            <button
              onClick={handleAnalyze}
              className="btn-primary btn-glow"
              style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700' }}
            >
              ⚡ Calculate RICE & Generate Roadmap →
            </button>
          </div>
        </section>

        {/* Right column: Explainer cards */}
        <aside className={styles.sidebar}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 className={styles.sidebarTitle}>HOW IT WORKS</h3>
            <div className={styles.stepList}>
              <div className={styles.stepItem}>
                <div className={styles.stepBadge}>1</div>
                <div>
                  <h4>✏️ Input Features</h4>
                  <p>Add your feature ideas with names, descriptions, and categories.</p>
                </div>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepBadge}>2</div>
                <div>
                  <h4>🤖 AI Scores Them</h4>
                  <p>Multi-provider AI analyzes each feature and calculates RICE scores with reasoning.</p>
                </div>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepBadge}>3</div>
                <div>
                  <h4>🗺️ Get Your Roadmap</h4>
                  <p>Receive a priority-ranked roadmap grouped into Now, Next, and Later sprints.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 className={styles.sidebarTitle}>📊 RICE Formula</h3>
            <div className={styles.formulaBox}>
              <div className={styles.formulaMath}>
                (Reach × Impact × Confidence) / Effort
              </div>
              <div className={styles.formulaGrid}>
                <div><strong>Reach:</strong> 1-10 (Users affected)</div>
                <div><strong>Impact:</strong> 1-10 (Metric lift)</div>
                <div><strong>Confidence:</strong> 10-100% (Certainty)</div>
                <div><strong>Effort:</strong> 1-10 (Person-months)</div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
