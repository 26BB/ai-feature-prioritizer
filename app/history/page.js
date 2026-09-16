'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/app/components/AuthModal';
import styles from './page.module.css';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading, logout, getUserHistory, deleteHistoryItem, isDemoMode } = useAuth();

  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      if (user) {
        setFetching(true);
        const data = await getUserHistory();
        setHistory(data || []);
        setFetching(false);
      } else {
        setHistory([]);
        setFetching(false);
      }
    }
    loadHistory();
  }, [user, getUserHistory]);

  function handleReopen(session) {
    if (!session || !session.features) return;
    const resultData = {
      features: session.features,
      model: session.model || 'NVIDIA AI',
      isCached: true,
    };
    sessionStorage.setItem('priorityResults', JSON.stringify(resultData));
    router.push('/results');
  }

  function handleExportCSV(session) {
    if (!session || !session.features) return;
    const escape = (str) => `"${(str ?? '').replace(/"/g, '""')}"`;
    const headers = ['Feature', 'RICE Score', 'Sprint', 'Reach', 'Impact', 'Confidence', 'Effort', 'Reasoning'];
    const rows = session.features.map((f) => [
      escape(f.name),
      f.rice_score,
      f.sprint,
      f.reach,
      f.impact,
      f.confidence,
      f.effort,
      escape(f.reasoning),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: `${(session.title || 'prioritization').toLowerCase().replace(/[^a-z0-9]/g, '_')}_results.csv`,
    });
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this prioritization from history?')) {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const totalSessions = history.length;
  const totalFeaturesEvaluated = history.reduce((acc, curr) => acc + (curr.featureCount || curr.features?.length || 0), 0);
  const highestRiceScore = history.reduce((max, curr) => Math.max(max, curr.topRice || 0), 0);

  return (
    <div className={styles.page}>
      <div className="bg-pattern" />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>PriorityAI</span>
        </Link>
        <div className={styles.navRight}>
          <button onClick={() => router.push('/')} className="btn-ghost" style={{ fontSize: '13px', padding: '6px 14px' }}>
            ← Dashboard
          </button>
          {user ? (
            <div className={styles.userBadge}>
              <span className={styles.userAvatar}>
                {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
              </span>
              <span>{user.displayName || user.email}</span>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '4px' }}
                title="Sign Out"
                aria-label="Sign Out"
              >
                🚪
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="container">
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>My History</h1>
          <p className={styles.headerSub}>
            Saved RICE prioritizations and roadmaps for {user ? user.displayName || user.email : 'guest'}
          </p>
        </header>

        {loading || fetching ? (
          <div className="glass-card" style={{ padding: '40px', textAlignment: 'center', color: 'var(--text-secondary)' }}>
            Loading your prioritization history...
          </div>
        ) : !user ? (
          /* Unauthenticated Banner */
          <div className={`${styles.authRequiredCard} glass-card-elevated`}>
            <div className={styles.authIcon}>🔒</div>
            <h2>Sign In Required</h2>
            <p className={styles.emptySub}>
              Sign in with Google or Email to save your prioritizations, view history, and export reports anytime.
            </p>
            {isDemoMode && (
              <p style={{ fontSize: '12px', color: '#34d399', marginBottom: '16px' }}>
                ⚡ Demo Mode active: Try instant mock login!
              </p>
            )}
            <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary">
              Sign In / Sign Up →
            </button>
          </div>
        ) : history.length === 0 ? (
          /* Empty History State */
          <div className={`${styles.emptyState} glass-card`}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No History Found</h3>
            <p className={styles.emptySub}>
              You haven&apos;t saved any feature prioritization sessions yet. Run an analysis on the dashboard to save it.
            </p>
            <button onClick={() => router.push('/')} className="btn-primary">
              + Prioritize Features Now
            </button>
          </div>
        ) : (
          /* History Content */
          <>
            {/* Stats Bar */}
            <div className={styles.statsBar}>
              <div className={`${styles.statCard} glass-card`}>
                <div className={styles.statVal}>{totalSessions}</div>
                <div className={styles.statLabel}>Saved Sessions</div>
              </div>
              <div className={`${styles.statCard} glass-card`}>
                <div className={styles.statVal}>{totalFeaturesEvaluated}</div>
                <div className={styles.statLabel}>Features Analyzed</div>
              </div>
              <div className={`${styles.statCard} glass-card`}>
                <div className={styles.statVal} style={{ color: 'var(--primary)' }}>{highestRiceScore}</div>
                <div className={styles.statLabel}>Highest RICE Score</div>
              </div>
            </div>

            {/* Session Cards */}
            <div className={styles.historyList}>
              {history.map((item) => {
                const dateStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent';

                const nowCount = item.features?.filter((f) => f.sprint?.toUpperCase() === 'NOW').length || 0;
                const nextCount = item.features?.filter((f) => f.sprint?.toUpperCase() === 'NEXT').length || 0;

                return (
                  <div key={item.id} className={`${styles.historyCard} glass-card`}>
                    <div className={styles.cardTop}>
                      <div>
                        <div className={styles.sessionTitle}>{item.title}</div>
                        <div className={styles.sessionMeta}>
                          <span>📅 {dateStr}</span>
                          <span>•</span>
                          <span>🤖 {item.model || 'Multi-Provider AI'}</span>
                        </div>
                      </div>

                      <div className={styles.pillsRow}>
                        <span className={styles.pill}>{item.featureCount || item.features?.length || 0} Features</span>
                        <span className="badge-now">{nowCount} NOW</span>
                        <span className="badge-next">{nextCount} NEXT</span>
                        <span className={styles.pill} style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: 'var(--primary-light)' }}>
                          Top RICE: {item.topRice}
                        </span>
                      </div>
                    </div>

                    {/* Features preview */}
                    {item.features?.length > 0 && (
                      <div className={styles.featurePreviewList}>
                        {item.features.slice(0, 3).map((f) => (
                          <div key={f.name} className={styles.previewItem}>
                            <span className={styles.previewName}>{f.name}</span>
                            <div className={styles.previewRight}>
                              <span className={`badge-${(f.sprint || 'later').toLowerCase()}`}>
                                {f.sprint || 'LATER'}
                              </span>
                              <span className={styles.previewScore}>{f.rice_score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)' }}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => handleExportCSV(item)}
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        ⬇ Export CSV
                      </button>
                      <button
                        onClick={() => handleReopen(item)}
                        className="btn-primary"
                        style={{ padding: '6px 16px', fontSize: '13px' }}
                      >
                        🚀 Re-open Session →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
