import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ObserverView: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('--:--:-- UTC');

  // Telemetry Telemetry Stats & Logs
  const [stats, setStats] = useState({ cpu: '12%', mem: '4.2G', net: '840M' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [throughputHeights, setThroughputHeights] = useState<number[]>([]);

  // UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const n = new Date();
      setTimeStr(
        String(n.getUTCHours()).padStart(2, '0') + ':' +
        String(n.getUTCMinutes()).padStart(2, '0') + ':' +
        String(n.getUTCSeconds()).padStart(2, '0') + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Telemetry updates
  useEffect(() => {
    // Initial chart heights
    const heights = Array.from({ length: 30 }, () => 15 + Math.floor(Math.random() * 85));
    setThroughputHeights(heights);

    const statsTimer = setInterval(() => {
      setStats({
        cpu: (8 + Math.random() * 18).toFixed(0) + '%',
        mem: (3.8 + Math.random() * 1.4).toFixed(1) + 'G',
        net: (700 + Math.random() * 400).toFixed(0) + 'M',
      });
    }, 2500);

    const chartTimer = setInterval(() => {
      setThroughputHeights(Array.from({ length: 30 }, () => 15 + Math.floor(Math.random() * 85)));
    }, 3000);

    return () => {
      clearInterval(statsTimer);
      clearInterval(chartTimer);
    };
  }, []);

  // Stylesheet Loader
  useEffect(() => {
    let coreLink = document.getElementById('axis-core-css') as HTMLLinkElement;
    if (!coreLink) {
      coreLink = document.createElement('link');
      coreLink.id = 'axis-core-css';
      coreLink.rel = 'stylesheet';
      coreLink.href = '/css/templatemo-axis-industrial.css';
      document.head.appendChild(coreLink);
    }

    let tabLink = document.getElementById('axis-tab-css') as HTMLLinkElement;
    if (tabLink) {
      tabLink.href = '/css/templatemo-axis-the-observer.css';
    } else {
      tabLink = document.createElement('link');
      tabLink.id = 'axis-tab-css';
      tabLink.rel = 'stylesheet';
      tabLink.href = '/css/templatemo-axis-the-observer.css';
      document.head.appendChild(tabLink);
    }

    document.body.style.backgroundColor = '#FFFFFF';
    document.body.style.fontFamily = "'JetBrains Mono', monospace";
    document.body.style.color = '#000000';

    return () => {
      // Cleanup on page switch
      if (coreLink) coreLink.remove();
      if (tabLink) tabLink.remove();
      document.body.style.backgroundColor = '';
      document.body.style.fontFamily = '';
      document.body.style.color = '';
    };
  }, []);

  // Scroll Reveal
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const logData = [
    { t: 'ok', m: 'Dispatch pipeline healthy — 12.4K messages/s' },
    { t: 'ok', m: 'Message routing model v2.1.4 active — 847 routes verified' },
    { t: 'sys', m: 'Database backup snapshot saved — latency 45ms' },
    { t: 'info', m: 'API gateway topology updated — 1,247 active nodes' },
    { t: 'ok', m: 'Heartbeat ping: collector-us-east-1a — 0.3ms' },
    { t: 'warn', m: 'Webhook latency spike +250ms ch.0442 — monitoring' },
    { t: 'ok', m: 'Auto-balancer active: clusters 8→12 scale up' },
    { t: 'sys', m: 'SSL credentials rotated successfully — sha256:a7f2c91d' },
    { t: 'ok', m: 'Causal dispatcher resolved — fallback disabled' },
    { t: 'info', m: 'Meta connection pool established — 60 active links' },
    { t: 'ok', m: 'Template cache refreshed — latency 1.2s' },
    { t: 'warn', m: 'Meta rate-limit warnings logged on compute-17' },
    { t: 'ok', m: 'Audit trail flushed — 4,847 records saved' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* ====== HEADER ====== */}
      <header className="header">
        <div className="header__inner">
          <div className="header__left">
            <Link to="/" className="header__logo" aria-label="WabMeta Home">
              <span className="header__logo-mark">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#FF3E00" strokeWidth="2.5" />
                  <line x1="12" y1="2" x2="12" y2="22" stroke="#FF3E00" strokeWidth="2" />
                </svg>
              </span>
              WabMeta
            </Link>
            <span className="header__sep"></span>
            <span className="header__product">The Observer / v2.1</span>
          </div>

          <nav className={`header__nav ${isMobileNavOpen ? 'open' : ''}`} id="headerNav">
            <Link to="/">Home</Link>
            <Link to="/product">Features</Link>
            <Link to="/observer" className="active">Live Status</Link>
            <a href="#features">Capabilities</a>
            <a href="#deploy">Deploy</a>
            <Link to="/documentation">Docs</Link>
          </nav>

          <div className="header__right">
            <div className="header__status">
              <span className="header__status-dot"></span>
              <span>All Systems Nominal</span>
            </div>
            <div className="header__clock">{timeStr}</div>
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.5rem' }}>
              <Link to="/login" className="tag tag--filled" style={{ padding: '0.35em 0.8rem', border: '1px solid var(--base)', fontSize: '0.62rem', letterSpacing: '0.05em' }}>Login</Link>
              <Link to="/signup" className="tag tag--safety" style={{ padding: '0.35em 0.8rem', border: '1px solid var(--safety)', fontSize: '0.62rem', letterSpacing: '0.05em' }}>Sign Up</Link>
            </div>
          </div>

          <button
            className="header__burger"
            aria-label="Toggle navigation"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* ====== LAYOUT SHELL ====== */}
      <div className="shell">
        <main className="shell__main">
          {/* ====== HERO ====== */}
          <section className="hero hero--radar">
            <div className="hero__grid" aria-hidden="true"></div>
            <div className="hero__rings" aria-hidden="true">
              <div className="hero__ring"></div>
              <div className="hero__ring"></div>
              <div className="hero__ring"></div>
              <div className="hero__ring"></div>
            </div>
            <div className="hero__label reveal">WabMeta Monitoring Dashboard</div>
            <h1 className="hero__title"><span className="line">The</span><span className="line line--indent">Observer<span className="dot">.</span></span></h1>
            <div className="hero__bottom">
              <p className="hero__desc reveal">Zero-latency dispatch anomaly detection across all message nodes. The Observer monitors so you can focus on building your business.</p>
              <div className="hero__kpis reveal">
                <div><div className="hero__kpi-val">0.04<span className="accent">ms</span></div><div className="hero__kpi-label">API Latency</div></div>
                <div><div className="hero__kpi-val">12K<span className="accent">+</span></div><div className="hero__kpi-label">Messages / Sec</div></div>
                <div><div className="hero__kpi-val">99.99<span className="accent">%</span></div><div className="hero__kpi-label">Success Rate</div></div>
              </div>
            </div>
          </section>

          {/* ====== METRICS RIBBON ====== */}
          <section className="ribbon reveal">
            <div className="ribbon__cell"><div className="ribbon__label">Uptime</div><div className="ribbon__value">99.997<span className="ribbon__unit">%</span></div><div className="bar-track"><div className="bar-track__fill" style={{ width: '99.9%' }}></div></div></div>
            <div className="ribbon__cell"><div className="ribbon__label">Avg Latency</div><div className="ribbon__value">0.04<span className="ribbon__unit">ms</span></div><div className="bar-track"><div className="bar-track__fill" style={{ width: '96%' }}></div></div></div>
            <div className="ribbon__cell"><div className="ribbon__label">Monthly Messages</div><div className="ribbon__value">847M<span className="ribbon__unit">/mo</span></div><div className="bar-track"><div className="bar-track__fill" style={{ width: '72%' }}></div></div></div>
            <div className="ribbon__cell"><div className="ribbon__label">Failure Rate</div><div className="ribbon__value">0.003<span className="ribbon__unit">%</span></div><div className="bar-track"><div className="bar-track__fill" style={{ width: '3%' }}></div></div></div>
            <div className="ribbon__cell"><div className="ribbon__label">Engine Version</div><div className="ribbon__value">v2.1<span className="ribbon__unit">.4</span></div><div className="bar-track"><div className="bar-track__fill" style={{ width: '100%' }}></div></div></div>
          </section>

          {/* ====== CAPABILITIES GRID ====== */}
          <section className="section" id="features">
            <div className="section__header reveal"><div className="section__eyebrow">// Telemetry capabilities</div><h2 className="section__title">What It<br />Monitors</h2></div>
            <div className="features__grid">
              <div className="feat-card reveal">
                <div>
                  <div className="feat-card__id">OB—01</div>
                  <div className="feat-card__icon">◎</div>
                  <h3 className="feat-card__title">Anomaly<br />Detection</h3>
                  <p className="feat-card__text">Unsupervised pattern recognition monitoring API load, delivery logs, and webhooks in real-time.</p>
                </div>
                <div className="spark">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="spark__bar" style={{ height: `${20 + Math.sin(i) * 60 + 20}%` }}></span>
                  ))}
                </div>
              </div>
              <div className="feat-card feat-card--dark reveal">
                <div>
                  <div className="feat-card__id">OB—02</div>
                  <div className="feat-card__icon">■</div>
                  <h3 className="feat-card__title">Root Cause<br />Isolation</h3>
                  <p className="feat-card__text">Finds the specific source of delivery drops or webhook timeouts under 40ms.</p>
                </div>
                <div className="feat-card__stat">&lt;40<span className="accent" style={{ fontSize: '0.4em' }}>ms</span></div>
              </div>
              <div className="feat-card reveal">
                <div>
                  <div className="feat-card__id">OB—03</div>
                  <div className="feat-card__icon">◆</div>
                  <h3 className="feat-card__title">Capacity<br />Forecasting</h3>
                  <p className="feat-card__text">Predicts high-load bottlenecks 72 hours in advance using historical dispatch volumes.</p>
                </div>
                <div className="feat-card__stat">72<span className="accent" style={{ fontSize: '0.4em' }}>hr</span></div>
              </div>
              <div className="feat-card reveal">
                <div>
                  <div className="feat-card__id">OB—04</div>
                  <div className="feat-card__icon">△</div>
                  <h3 className="feat-card__title">Queue<br />Topology</h3>
                  <p className="feat-card__text">Visualizes message flows, dispatch nodes, database clusters, and API ingress targets.</p>
                </div>
                <div className="spark">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="spark__bar" style={{ height: `${15 + Math.cos(i) * 55 + 20}%` }}></span>
                  ))}
                </div>
              </div>
              <div className="feat-card feat-card--safety reveal">
                <div>
                  <div className="feat-card__id">OB—05</div>
                  <div className="feat-card__icon">⌂</div>
                  <h3 className="feat-card__title">Auto<br />Failover</h3>
                  <p className="feat-card__text">Switches message routing pathways automatically when connection health falls below 99.5%.</p>
                </div>
                <div className="feat-card__stat">99.5<span style={{ fontSize: '0.4em', opacity: 0.7 }}>%</span></div>
              </div>
              <div className="feat-card reveal">
                <div>
                  <div className="feat-card__id">OB—06</div>
                  <div className="feat-card__icon">◯</div>
                  <h3 className="feat-card__title">Compliance<br />Logs</h3>
                  <p className="feat-card__text">Every API action, callback, and notification logged immutably. HIPAA & SOC 2 audit-ready.</p>
                </div>
                <div className="spark">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="spark__bar" style={{ height: '100%' }}></span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ====== SIGNAL SECTION ====== */}
          <section className="section section--surface" id="signal">
            <div className="signal__inner">
              <div className="reveal">
                <div className="section__eyebrow">// Ingress Analysis</div>
                <h2 className="section__title">Reads the<br />Noise</h2>
                <p className="signal__text">The Observer ingests raw messaging telemetry — webhooks, statuses, API payloads — and isolates issues instantly. No manual parsing required.</p>
                <div className="signal__tags">
                  <span className="tag">Webhooks</span>
                  <span className="tag tag--filled">Callbacks</span>
                  <span className="tag">Templates</span>
                  <span className="tag tag--safety">Chats</span>
                  <span className="tag tag--ghost">Statuses</span>
                  <span className="tag">Nodes</span>
                </div>
              </div>
              <div className="signal__viz reveal">
                <div className="signal__viz-header">
                  <div className="signal__viz-title">Live Dispatch Signal — ch.001→128</div>
                  <div className="signal__viz-status">Stream Active</div>
                </div>
                <div className="signal__viz-canvas">
                  <div className="signal__viz-bars" id="waveformBars">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className="signal__viz-bar"
                        style={{
                          animationDelay: `${-(i * 0.07)}s`,
                          animationDuration: `${1.2 + Math.random() * 1.2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="signal__viz-footer"><span>0ms</span><span>Sample Window: 500ms</span><span>500ms</span></div>
              </div>
            </div>
          </section>

          {/* ====== CTA ====== */}
          <section className="section cta" id="deploy">
            <div className="reveal">
              <h2 className="cta__title">Start Scaling<br />in Under 5<span className="accent"> Min</span></h2>
              <p className="cta__text">Link your Meta app or register with our embedded signup. Start sending broadcasts, configuring automations, and tracking logs immediately.</p>
              <div className="cta__actions">
                <Link to="/signup" className="btn btn--primary">Start Free Trial</Link>
                <Link to="/documentation" className="btn btn--ghost">Read the Docs</Link>
              </div>
            </div>
          </section>
        </main>

        {/* ====== TERMINAL SIDEBAR ====== */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
          <div className="sidebar__header"><div className="sidebar__title">Gateway Logs</div><div className="sidebar__meta">PID 48271</div></div>
          <div className="sidebar__stats">
            <div className="sidebar__stat"><div className="sidebar__stat-label">CPU</div><div className="sidebar__stat-val">{stats.cpu}</div></div>
            <div className="sidebar__stat"><div className="sidebar__stat-label">MEM</div><div className="sidebar__stat-val">{stats.mem}</div></div>
            <div className="sidebar__stat"><div className="sidebar__stat-label">NET</div><div className="sidebar__stat-val">{stats.net}</div></div>
          </div>
          <div className="sidebar__chart">
            <div className="sidebar__chart-title">API Throughput — Last 60s</div>
            <div className="sidebar__chart-bars">
              {throughputHeights.map((h, i) => (
                <div
                  key={i}
                  className="sidebar__chart-col"
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          </div>
          <div className="sidebar__log">
            <div className="sidebar__log-scroll">
              <div className="sidebar__log-track">
                {logData.map((e, i) => (
                  <div key={i} className="sidebar__log-entry">
                    <span className="sidebar__log-time">{String(12).padStart(2, '0') + ':' + String(i * 4).padStart(2, '0') + ':00Z'}</span>
                    <span className={`sidebar__log-tag log-${e.t}`}>{e.t.toUpperCase()}</span>
                    <span className="sidebar__log-msg">{e.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="sidebar__footer"><span>WabEngine v2.1.4</span><span>Uptime: Active</span></div>
        </aside>

        <button className="sidebar-toggle" id="sidebarToggle" aria-label="Toggle terminal" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? '✕' : '>_'}
        </button>
      </div>

      {/* ====== FOOTER ====== */}
      <footer className="footer footer--compact">
        <div className="footer__inner">
          <div className="footer__left">
            <span className="footer__logo font-display">WabMeta<span className="accent">.</span></span>
            <div className="footer__links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Support</a></div>
          </div>
          <span className="footer__copy">&copy; 2026 WabMeta. &nbsp;|&nbsp; Designed in the style of Axis Industrial</span>
        </div>
      </footer>
    </div>
  );
};

export default ObserverView;
