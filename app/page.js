'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────
// Defined at module level so they aren't re-created on every render
const CATEGORIES = ['AI/ML', 'Infrastructure', 'UX/Design', 'Growth', 'Analytics', 'Security', 'Other'];

const LOADING_STEPS = [
  'Parsing feature descriptions...',
  'Calculating RICE scores with AI...',
  'Generating sprint roadmap...',
  'Preparing visualizations...',
];

/** Returns a fresh blank feature object. Function form prevents shared reference bugs. */
const makeEmptyFeature = () => ({ name: '', description: '', category: 'AI/ML' });

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  const [features, setFeatures]   = useState([makeEmptyFeature(), makeEmptyFeature(), makeEmptyFeature()]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // ─── Feature list mutations ──────────────────────────────────────────────
  function addFeature() {
    if (features.length < 10) setFeatures([...features, makeEmptyFeature()]);
  }

  function removeFeature(idx) {
    // Always keep at least one card so the form is never empty
    if (features.length > 1) setFeatures(features.filter((_, i) => i !== idx));
  }

  function updateFeature(idx, field, value) {
    setFeatures(features.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  }

  // ─── Submit ──────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    // Only submit features that have a non-empty, non-whitespace name
    const valid = features.filter((f) => f.name.trim());

    if (valid.length === 0) {
      setError('Please add at least one feature name.');
      return;
    }

    setError('');
    setLoading(true);
    setCurrentStep(0);

    // Advance the loading step indicator every 1.2 s for UX feedback
    // ponytail: interval is cosmetic only; actual progress comes from the fetch resolving
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= LOADING_STEPS.length) clearInterval(stepTimer);
        return next;
      });
    }, 1200);

    try {
      const res  = await fetch('/api/prioritize', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ features: valid }),
      });
      const data = await res.json();
      clearInterval(stepTimer);

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Pass results to the results page via sessionStorage
      // ponytail: sessionStorage ceiling = same tab only; upgrade to URL param or server state for multi-tab
      sessionStorage.setItem('priorityResults', JSON.stringify(data));
      router.push('/results');
    } catch {
      clearInterval(stepTimer);
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  }

  // ─── Loading screen ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className="bg-pattern" />
        <div className={`${styles.loadingCard} glass-card-elevated`}>
          <div className={styles.nvidiaIcon}>⚡</div>
          <h2>Analyzing Your Features</h2>
          <p className={styles.loadingSubtitle}>Powered by NVIDIA · Llama 3.3 70B Instruct</p>

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

  // ─── Main form ───────────────────────────────────────────────────────────
  const filledCount = features.filter((f) => f.name.trim()).length;

  return (
    <div className={styles.page}>
      <div className="bg-pattern" />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>PriorityAI</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>History</a>
          <a href="#" className={styles.navLink}>Settings</a>
        </div>
        <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
          + New Session
        </button>
      </nav>

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroBadge}>✦ Powered by NVIDIA NIM</div>
        <h1 className={styles.heroTitle}>
          Prioritize Smarter{' '}
          <span className={styles.heroGradient}>with AI</span>
        </h1>
        <p className={styles.heroSub}>
          Input your feature ideas. Get RICE scores, effort vs impact analysis,
          and a sprint roadmap — in seconds.
        </p>
      </header>

      {/* ── Two-column layout ── */}
      <main className={styles.main}>

        {/* Left column: feature input cards */}
        <section className={styles.inputSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Features</h2>
            <span className={styles.featureCount}>{filledCount}/{features.length} filled</span>
          </div>

          <div className={styles.featureList}>
            {features.map((feature, idx) => (
              <div key={idx} className={`${styles.featureCard} glass-card`}>
                <div className={styles.cardHeader}>
                  <span className={styles.featureNumber}>#{idx + 1}</span>
                  {features.length > 1 && (
                    <button
                      onClick={() => removeFeature(idx)}
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
                    onChange={(e) => updateFeature(idx, 'name', e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor={`desc-${idx}`} className={styles.fieldLabel}>Description</label>
                  <textarea
                    id={`desc-${idx}`}
                    className={`input-field ${styles.textarea}`}
                    placeholder="What does this feature do? Who benefits? What problem does it solve?"
                    value={feature.description}
                    onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor={`cat-${idx}`} className={styles.fieldLabel}>Category</label>
                  <select
                    id={`cat-${idx}`}
                    className="input-field"
                    value={feature.category}
                    onChange={(e) => updateFeature(idx, 'category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {features.length < 10 && (
            <button onClick={addFeature} className={`btn-ghost ${styles.addBtn}`}>
              + Add Feature
            </button>
          )}

          {error && <p className={styles.error} role="alert">⚠ {error}</p>}

          <button
            onClick={handleAnalyze}
            className={`btn-primary ${styles.analyzeBtn}`}
            disabled={loading}
          >
            Analyze Features →
          </button>
        </section>

        {/* Right column: explainer sidebar */}
        <aside className={styles.sidebar}>
          <div className={`${styles.howItWorks} glass-card`}>
            <h3 className={styles.sidebarTitle}>How it works</h3>
            <div className={styles.steps}>
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <div key={i} className={styles.howStep}>
                  <div className={styles.stepNumBadge}>{i + 1}</div>
                  <div>
                    <div className={styles.stepTitle}>{step.icon} {step.title}</div>
                    <div className={styles.stepDesc}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.riceTip} glass-card`}>
            <h4 className={styles.tipTitle}>📊 RICE Formula</h4>
            <div className={styles.riceFormula}>
              RICE = (Reach × Impact × Confidence) / Effort
            </div>
            <div className={styles.riceComponents}>
              {RICE_LEGEND.map((c) => (
                <div key={c.label} className={styles.riceComponent}>
                  <span className={styles.riceLabel}>{c.label}</span>
                  <div>
                    <div className={styles.riceName}>{c.name}</div>
                    <div className={styles.riceDesc}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

// ─── Static data (module-level, not re-created on render) ────────────────────
const HOW_IT_WORKS_STEPS = [
  { icon: '✏️', title: 'Input Features',  desc: 'Add your feature ideas with names, descriptions, and categories.' },
  { icon: '🤖', title: 'AI Scores Them',  desc: 'NVIDIA AI analyzes each feature and calculates RICE scores with reasoning.' },
  { icon: '🗺️', title: 'Get Your Roadmap', desc: 'Receive a priority-ranked roadmap grouped into Now, Next, and Later sprints.' },
];

const RICE_LEGEND = [
  { label: 'R', name: 'Reach',      desc: 'Users impacted / quarter' },
  { label: 'I', name: 'Impact',     desc: 'Metric movement (1–10)' },
  { label: 'C', name: 'Confidence', desc: 'Estimate certainty %' },
  { label: 'E', name: 'Effort',     desc: 'Person-months to build' },
];
