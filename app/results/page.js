'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { groupBySprint, getScoreColor } from '@/lib/scoring';
import styles from './page.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = ['Score Cards', 'Matrix Chart', 'Roadmap'];
const TAB_ICONS = ['🃏', '📊', '🗺️'];

/** Sprint lanes config — drives the Roadmap tab rendering */
const SPRINT_LANES = [
  { key: 'NOW',   icon: '⚡', label: 'NOW — This Sprint',  cssClass: 'laneNow'   },
  { key: 'NEXT',  icon: '🔜', label: 'NEXT — Next Sprint', cssClass: 'laneNext'  },
  { key: 'LATER', icon: '📋', label: 'LATER — Backlog',    cssClass: 'laneLater' },
];

/** RICE component definitions for the score card bars */
const RICE_BARS = [
  { label: 'Reach',      field: 'reach',      max: 10,  suffix: '',  inverse: false },
  { label: 'Impact',     field: 'impact',     max: 10,  suffix: '',  inverse: false },
  { label: 'Confidence', field: 'confidence', max: 100, suffix: '%', inverse: false },
  { label: 'Effort',     field: 'effort',     max: 10,  suffix: '',  inverse: true  },
];

/** Amber-theme colors for chart bubbles — mirrors globals.css tokens */
const BUBBLE_COLORS = {
  NOW:   { bg: 'rgba(16,185,129,0.45)',  border: '#10b981' },
  NEXT:  { bg: 'rgba(245,158,11,0.45)', border: '#f59e0b' },
  LATER: { bg: 'rgba(120,113,108,0.35)', border: '#78716c' },
};

/** Stats bar config — colors stay in sync with the amber theme */
const buildStats = (data, groups) => [
  { label: 'Total Features', val: data.features.length,           color: 'var(--text-primary)'  },
  { label: 'NOW',            val: groups.NOW.length,              color: '#10b981'               },
  { label: 'NEXT',           val: groups.NEXT.length,             color: '#f59e0b'               },
  { label: 'LATER',          val: groups.LATER.length,            color: '#78716c'               },
  { label: 'Top RICE',       val: data.features[0]?.rice_score,   color: 'var(--primary)'       },
  { label: 'AI Model',       val: 'Llama 3.3 70B',                color: 'var(--primary-light)' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Results() {
  const router = useRouter();

  const [data, setData]           = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const chartRef                  = useRef(null);
  const chartInstance             = useRef(null);

  // ─── Load results from sessionStorage on mount ───────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem('priorityResults');
    if (!raw) {
      router.push('/');
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      // Corrupt sessionStorage data — send user back to start
      sessionStorage.removeItem('priorityResults');
      router.push('/');
    }
  }, [router]);

  // ─── Draw Chart.js bubble chart when Matrix tab is active ─────────────────
  useEffect(() => {
    if (activeTab !== 1 || !data || !chartRef.current) return;

    async function drawChart() {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      // Destroy previous instance to avoid canvas reuse errors
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const datasets = data.features.map((f) => {
        const sprintKey   = f.sprint?.toUpperCase() ?? 'LATER';
        const colors      = BUBBLE_COLORS[sprintKey] ?? BUBBLE_COLORS.LATER;
        // ponytail: bubble radius is a linear approximation of RICE score; not log-scaled
        const bubbleRadius = Math.max(8, Math.min(30, f.rice_score / 40));

        return {
          label:           f.name,
          data:            [{ x: f.effort, y: f.impact, r: bubbleRadius }],
          backgroundColor: colors.bg,
          borderColor:     colors.border,
          borderWidth:     2,
        };
      });

      const AXIS_COLOR  = '#b5b0a3'; // matches --text-secondary in amber theme
      const GRID_COLOR  = 'rgba(255,255,255,0.05)';

      chartInstance.current = new Chart(chartRef.current, {
        type: 'bubble',
        data: { datasets },
        options: {
          responsive:          true,
          maintainAspectRatio: false,
          scales: {
            x: {
              min: 0, max: 11,
              title: { display: true, text: 'Effort (person-months)', color: AXIS_COLOR },
              grid:  { color: GRID_COLOR },
              ticks: { color: AXIS_COLOR },
            },
            y: {
              min: 0, max: 11,
              title: { display: true, text: 'Impact (1–10)', color: AXIS_COLOR },
              grid:  { color: GRID_COLOR },
              ticks: { color: AXIS_COLOR },
            },
          },
          plugins: {
            legend: {
              position: 'right',
              labels: { color: AXIS_COLOR, padding: 16, boxWidth: 12 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const f = data.features.find((f) => f.name === ctx.dataset.label);
                  return f
                    ? [f.name, `RICE: ${f.rice_score}`, `Sprint: ${f.sprint}`]
                    : [];
                },
              },
            },
          },
        },
      });
    }

    drawChart();

    // Cleanup: destroy chart when tab changes or component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [activeTab, data]);

  // ─── CSV export (no deps — uses native Blob + URL API) ──────────────────
  function exportCSV() {
    if (!data) return;

    // ponytail: double-quote escaping per RFC 4180; ceiling = no multi-line fields
    const escape = (str) => `"${(str ?? '').replace(/"/g, '""')}"`;

    const headers = ['Feature', 'RICE Score', 'Sprint', 'Reach', 'Impact', 'Confidence', 'Effort', 'Reasoning'];
    const rows    = data.features.map((f) => [
      escape(f.name), f.rice_score, f.sprint,
      f.reach, f.impact, f.confidence, f.effort,
      escape(f.reasoning),
    ]);

    const csv  = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'priority-ai-results.csv' });
    link.click();
    URL.revokeObjectURL(url);
  }

  // ─── Loading fallback (before sessionStorage resolves) ──────────────────
  if (!data) {
    return (
      <div className={styles.loading}>
        <div className="bg-pattern" />
        <div className={styles.loadingText}>Loading results...</div>
      </div>
    );
  }

  // ─── Derived data (computed once per render) ─────────────────────────────
  const groups = groupBySprint(data.features);
  const stats  = buildStats(data, groups);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className="bg-pattern" />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>PriorityAI</span>
        </div>
        <div className={styles.breadcrumb}>
          <a href="/" className={styles.breadcrumbLink}>← New Session</a>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>
            Results · {data.features.length} features analyzed
          </span>
        </div>
        <button onClick={exportCSV} className="btn-ghost">⬇ CSV</button>
      </nav>

      {/* ── Stats bar ── */}
      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsRow}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statVal} style={{ color: s.color }}>{s.val}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className={styles.tabBar}>
        <div className="container">
          <div className={styles.tabs}>
            {TABS.map((label, i) => (
              <button
                key={label}
                onClick={() => setActiveTab(i)}
                className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
              >
                {TAB_ICONS[i]} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <main className={styles.main}>
        <div className="container">

          {/* Tab 0 — Score Cards */}
          {activeTab === 0 && (
            <div className={styles.cardsGrid}>
              {data.features.map((f, i) => (
                <div
                  key={f.name}
                  className={`${styles.scoreCard} glass-card animate-fade-in`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={styles.cardTop}>
                    <h3 className={styles.featureName}>{f.name}</h3>
                    {/* ponytail: optional chaining guards null sprint from LLM */}
                    <span className={`badge-${(f.sprint ?? 'later').toLowerCase()}`}>
                      {f.sprint ?? 'LATER'}
                    </span>
                  </div>

                  <div className={styles.riceScore}>
                    <span className="score-number">{f.rice_score}</span>
                    <span className={styles.riceLabel}>RICE</span>
                  </div>

                  {/* RICE component mini-bars */}
                  <div className={styles.riceComponents}>
                    {RICE_BARS.map((bar) => (
                      <div key={bar.label} className={styles.component}>
                        <div className={styles.componentHeader}>
                          <span className={styles.componentLabel}>{bar.label}</span>
                          <span className={styles.componentVal}>{f[bar.field]}{bar.suffix}</span>
                        </div>
                        <div className={styles.componentBar}>
                          <div
                            className={styles.componentFill}
                            style={{
                              width:      `${(f[bar.field] / bar.max) * 100}%`,
                              background: bar.inverse
                                ? (f[bar.field] > 6 ? 'var(--danger)' : 'var(--secondary)')
                                : 'var(--gradient-primary)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {f.reasoning && <p className={styles.reasoning}>"{f.reasoning}"</p>}

                  {f.risks?.length > 0 && (
                    <div className={styles.risks}>
                      {f.risks.slice(0, 3).map((r) => (
                        <span key={r} className="tag-risk">⚠ {r}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 1 — Matrix Chart */}
          {activeTab === 1 && (
            <div className={`${styles.chartSection} glass-card`}>
              <div className={styles.chartHeader}>
                <h2>Effort vs Impact Matrix</h2>
                <p className={styles.chartSubtitle}>Bubble size = RICE score magnitude</p>
              </div>
              <div className={styles.quadrantLabels}>
                <span className={`${styles.ql} ${styles.qlTL}`}>⚡ Quick Wins</span>
                <span className={`${styles.ql} ${styles.qlTR}`}>🚀 Big Bets</span>
                <span className={`${styles.ql} ${styles.qlBL}`}>🔧 Fill-ins</span>
                <span className={`${styles.ql} ${styles.qlBR}`}>💸 Money Pit</span>
              </div>
              <div className={styles.chartContainer}>
                <canvas ref={chartRef} />
              </div>
            </div>
          )}

          {/* Tab 2 — Roadmap */}
          {activeTab === 2 && (
            <div className={styles.roadmap}>
              {SPRINT_LANES.map(({ key, icon, label, cssClass }) => (
                <div key={key} className={styles.swimLane}>
                  <div className={`${styles.laneHeader} ${styles[cssClass]}`}>
                    <span>{icon}</span>
                    <span>{label}</span>
                    <span className={styles.laneCount}>{groups[key].length}</span>
                  </div>

                  <div className={styles.laneCards}>
                    {groups[key].length === 0 ? (
                      <div className={styles.emptyLane}>No features in this sprint</div>
                    ) : (
                      groups[key].map((f) => (
                        <div key={f.name} className={`${styles.roadmapCard} glass-card`}>
                          <div className={styles.roadmapTop}>
                            <span className={styles.roadmapName}>{f.name}</span>
                            <span
                              className={styles.roadmapScore}
                              style={{ color: getScoreColor(f.rice_score) }}
                            >
                              {f.rice_score}
                            </span>
                          </div>

                          {/* Mini R / I / E chips */}
                          <div className={styles.roadmapComponents}>
                            {['reach', 'impact', 'effort'].map((k) => (
                              <div key={k} className={styles.miniStat}>
                                <span className={styles.miniLabel}>{k[0].toUpperCase()}</span>
                                <span className={styles.miniVal}>{f[k]}</span>
                              </div>
                            ))}
                          </div>

                          {f.reasoning && <p className={styles.roadmapReason}>"{f.reasoning}"</p>}

                          {f.risks?.length > 0 && (
                            <div className={styles.risks}>
                              {f.risks.slice(0, 2).map((r) => (
                                <span key={r} className="tag-risk">⚠ {r}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}

              <div className={styles.roadmapActions}>
                <button onClick={exportCSV} className="btn-primary">⬇ Export CSV</button>
                <button onClick={() => router.push('/')} className="btn-ghost">← New Analysis</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
