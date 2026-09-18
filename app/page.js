'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './landing.module.css';
import pageStyles from './page.module.css';
import ApiKeyModal from './components/ApiKeyModal';
import AuthModal from './components/AuthModal';

export default function LandingHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className={styles.landingPage}>
      <div className="bg-pattern" />

      {/* Settings & Auth Modals */}
      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className={pageStyles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <span className={pageStyles.logoIcon}>◈</span>
          <span className={pageStyles.logoText}>PriorityAI</span>
        </div>
        <div className={pageStyles.navLinks}>
          <Link href="/" className={`${pageStyles.navLink} ${pageStyles.navActive}`}>Home</Link>
          <Link href="/analyze" className={pageStyles.navLink}>Workspace</Link>
          <Link href="/history" className={pageStyles.navLink}>My History</Link>
          <button onClick={() => setIsModalOpen(true)} className={pageStyles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
          <Link
            href="/analyze"
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px', textDecoration: 'none' }}
          >
            + Launch Workspace
          </Link>
        </div>
      </nav>

      {/* ── Hero Section with Word Motion Animations ── */}
      <header className={styles.heroSection}>
        <div className={`${styles.badge} typewriter-cursor`}>
          📖 Retro Vintage Paperbacks & Terracotta Yellow Edition
        </div>
        <h1 className={styles.heroTitle}>
          <span className="word-float">Prioritize</span> <span className="word-float">Backlogs</span> <br />
          <span className={styles.heroGradient}>10x Faster with AI RICE Scoring</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Turn raw feature ideas into <span className="word-float" style={{ fontWeight: '700', color: '#1A1613' }}>executive-ready</span> RICE scorecards, 2×2 Effort vs. Impact matrices,
          and <span className="word-float" style={{ fontWeight: '700', color: '#1A1613' }}>NOW/NEXT/LATER</span> sprint roadmaps in seconds.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/analyze" className={styles.primaryCta}>
            ⚡ Launch Prioritizer Workspace →
          </Link>
          <button onClick={() => setIsModalOpen(true)} className={styles.secondaryCta}>
            ⚙️ Configure Provider / BYOK
          </button>
        </div>
      </header>

      {/* ── Live Preview Teaser Card ── */}
      <section className={styles.previewWrapper}>
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <div className={styles.previewDots}>
              <div className={styles.dotRed} />
              <div className={styles.dotYellow} />
              <div className={styles.dotGreen} />
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#524941' }}>
              Live RICE Scorecard Teaser
            </span>
          </div>

          <div className={styles.previewGrid}>
            <div className={styles.sampleCard}>
              <div className={styles.sampleTitle}>AI Semantic Search</div>
              <div className={styles.sampleScore}>768 RICE</div>
              <span className={styles.pillNow}>⚡ NOW — Sprint 1</span>
              <p style={{ fontSize: '0.85rem', color: '#524941', marginTop: '10px' }}>
                High reach (9/10) across enterprise users with low engineering effort (3/10).
              </p>
            </div>

            <div className={styles.sampleCard}>
              <div className={styles.sampleTitle}>Automated CSV Export</div>
              <div className={styles.sampleScore}>540 RICE</div>
              <span className={styles.pillNow}>⚡ NOW — Sprint 1</span>
              <p style={{ fontSize: '0.85rem', color: '#524941', marginTop: '10px' }}>
                High metric lift for user retention with minimal developer overhead.
              </p>
            </div>

            <div className={styles.sampleCard}>
              <div className={styles.sampleTitle}>Custom Webhook Triggers</div>
              <div className={styles.sampleScore}>320 RICE</div>
              <span className="pillNext" style={{ background: '#FFDE59', color: '#1A1613', border: '1.5px solid #1A1613', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                🔜 NEXT — Sprint 2
              </span>
              <p style={{ fontSize: '0.85rem', color: '#524941', marginTop: '10px' }}>
                Solid impact for power users; scheduled for next development cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics Banner ── */}
      <section className={styles.metricsSection}>
        <div className={styles.metricsGrid}>
          <div>
            <div className={styles.metricVal}>10,000+</div>
            <div className={styles.metricLabel}>Features Prioritized</div>
          </div>
          <div>
            <div className={styles.metricVal}>4+</div>
            <div className={styles.metricLabel}>AI Providers Supported</div>
          </div>
          <div>
            <div className={styles.metricVal}>100%</div>
            <div className={styles.metricLabel}>Deterministic Math Fallback</div>
          </div>
          <div>
            <div className={styles.metricVal}>0s</div>
            <div className={styles.metricLabel}>Cached Instant Load</div>
          </div>
        </div>
      </section>

      {/* ── Balanced 6-Card Feature Showcase Grid ── */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionHeading}>
          <span className="word-float">Everything</span> You Need to <span className="animated-word-shimmer">Align Stakeholders</span>
        </h2>
        <p className={styles.sectionSub}>Engineered specifically for Growth Product Managers, Tech Leads, and Founders.</p>

        <div className={styles.featureGrid}>
          <div className={styles.featureBox}>
            <span className={styles.featureIcon}>🃏</span>
            <h3 className={styles.featureTitle}>AI RICE Score Cards</h3>
            <p className={styles.featureDesc}>
              Automated scoring for Reach, Impact, Confidence, and Effort with LLM rationale and automated risk tags.
            </p>
          </div>

          <div className={styles.featureBox}>
            <span className={styles.featureIcon}>📊</span>
            <h3 className={styles.featureTitle}>Interactive 2×2 Matrix</h3>
            <p className={styles.featureDesc}>
              Visual Effort vs. Impact bubble plots categorizing features across high-impact quadrants instantly.
            </p>
          </div>

          <div className={styles.featureBox}>
            <span className={styles.featureIcon}>🗺️</span>
            <h3 className={styles.featureTitle}>NOW / NEXT / LATER Roadmaps</h3>
            <p className={styles.featureDesc}>
              Auto-grouped sprint swimlanes with 1-click CSV export ready for Jira, Linear, or Notion.
            </p>
          </div>

          <div className={styles.featureBox}>
            <span className={styles.featureIcon}>🔑</span>
            <h3 className={styles.featureTitle}>Bring Your Own Key (BYOK)</h3>
            <p className={styles.featureDesc}>
              Use your own Gemini, OpenAI, or Groq API keys or server-pooled keys seamlessly without rate limits.
            </p>
          </div>

          <div className={styles.featureBox}>
            <span className={styles.featureIcon}>⚡</span>
            <h3 className={styles.featureTitle}>Zero-Cost Response Cache</h3>
            <p className={styles.featureDesc}>
              Identical backlogs load instantly from browser cache with 0 API cost and instant load times.
            </p>
          </div>

          <div className={styles.featureBox}>
            <span className={styles.featureIcon}>📱</span>
            <h3 className={styles.featureTitle}>Firebase & PWA App Install</h3>
            <p className={styles.featureDesc}>
              Save prioritized sessions directly to your Google/Email account and install as a native desktop/mobile app.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom Conversion Banner ── */}
      <section className={styles.bottomCtaSection}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '16px', color: '#1A1613' }}>
          Ready to Build Better Roadmaps?
        </h2>
        <p style={{ color: '#524941', fontSize: '1.1rem', fontWeight: '600', marginBottom: '32px' }}>
          Join product managers shipping higher-impact features with AI speed.
        </p>
        <Link href="/analyze" className={styles.primaryCta}>
          ⚡ Start Free Analysis Workspace →
        </Link>
      </section>
    </div>
  );
}
