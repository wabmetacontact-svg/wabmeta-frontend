import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductDetail: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('--:--:-- UTC');

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
      tabLink.href = '/css/templatemo-axis-landing-page.css';
    } else {
      tabLink = document.createElement('link');
      tabLink.id = 'axis-tab-css';
      tabLink.rel = 'stylesheet';
      tabLink.href = '/css/templatemo-axis-landing-page.css';
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
            <span className="header__product">WabMeta Core</span>
          </div>

          <nav className={`header__nav ${isMobileNavOpen ? 'open' : ''}`} id="headerNav">
            <Link to="/">Home</Link>
            <Link to="/product" className="active">Features</Link>
            <Link to="/observer">Live Status</Link>
            <a href="#overview">Overview</a>
            <a href="#specs">Specs</a>
            <Link to="/documentation">Docs</Link>
          </nav>

          <div className="header__right">
            <div className="header__status">
              <span className="header__status-dot"></span>
              <span>Online</span>
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

      {/* ====== HERO ====== */}
      <section className="hero hero--center hero--product">
        <div className="hero__grid" aria-hidden="true"></div>
        <div className="hero__label reveal">High-Throughput Dispatches</div>
        <h1 className="hero__title">WabMeta<span className="accent-dot">.</span>Core</h1>
        <p className="hero__subtitle reveal">Messaging Engine</p>
        <p className="hero__desc reveal" style={{ marginBottom: '3rem' }}>Sub-millisecond routing latency. Parallel queue structures. The WhatsApp Business API infrastructure built for high-stakes, zero-compromise deliverability.</p>
        <div className="hero__actions reveal">
          <Link to="/signup" className="btn btn--primary">Get Started Now</Link>
          <Link to="/documentation" className="btn btn--ghost">Read the Docs</Link>
        </div>
        <span className="hero__coords" aria-hidden="true">API v4.2 — Active</span>
        <span className="hero__version" aria-hidden="true">Cluster Node — Active</span>
      </section>

      {/* ====== PRODUCT DETAILS ====== */}
      <section className="section" id="overview">
        <div className="details__inner">
          <div className="details__left reveal">
            <div className="section__eyebrow">// High-Performance Pipeline</div>
            <h2 className="section__title">Engineered for<br />Zero Failure</h2>
            <p className="details__text" style={{ marginTop: '1.5rem' }}>WabMeta Core powers your WhatsApp communications. Custom message queues, automatic rate-limiting protection, and direct Meta API integration designed to bypass server delays and deliver campaigns instantly.</p>
          </div>
          <div className="details__right">
            <div className="stat-card reveal"><div className="stat-card__label">Dispatch Latency</div><div className="stat-card__value">0.08<span className="stat-card__unit accent">ms</span></div></div>
            <div className="stat-card stat-card--dark reveal"><div className="stat-card__label">API Uptime</div><div className="stat-card__value">99.99<span className="stat-card__unit">%</span></div></div>
            <div className="stat-card reveal"><div className="stat-card__label">Message Throughput</div><div className="stat-card__value">50K<span className="stat-card__unit">/s</span></div></div>
            <div className="stat-card reveal"><div className="stat-card__label">Delivery Precision</div><div className="stat-card__value">100<span className="stat-card__unit accent">%</span></div></div>
          </div>
        </div>
      </section>

      {/* ====== SPEC GRID ====== */}
      <section className="section section--surface" id="specs">
        <div className="container">
          <div className="section__header reveal">
            <div className="section__eyebrow">// Technical Specifications</div>
            <h2 className="section__title">Full Spec<br />Breakdown</h2>
          </div>
          <div className="spec-grid reveal">
            <div className="spec-cell"><div><div className="spec-cell__id">SP-01</div><div className="spec-cell__label">Routing Latency</div></div><div><div className="spec-cell__value">0.08<span className="spec-cell__unit">ms</span></div><div className="bar-track"><div className="bar-track__fill" style={{ width: '98%' }}></div></div></div></div>
            <div className="spec-cell spec-cell--dark"><div><div className="spec-cell__id">SP-02</div><div className="spec-cell__label">Failover queues</div></div><div><div className="spec-cell__value">5<span className="spec-cell__unit">sec</span></div><div className="spec-cell__note">Multi-node Redis cluster with automatic failover recovery.</div></div></div>
            <div className="spec-cell"><div><div className="spec-cell__id">SP-03</div><div className="spec-cell__label">Data Protection</div></div><div><div className="spec-cell__value">AES-256</div><div className="spec-cell__note">End-to-end data encryption. Compliance-ready secure vault.</div></div></div>
            <div className="spec-cell spec-cell--safety"><div><div className="spec-cell__id">SP-04</div><div className="spec-cell__label">Webhook Speed</div></div><div><div className="spec-cell__value">15<span className="spec-cell__unit">ms</span></div><div className="bar-track"><div className="bar-track__fill" style={{ width: '100%' }}></div></div></div></div>
            <div className="spec-cell"><div><div className="spec-cell__id">SP-05</div><div className="spec-cell__label">API Call Limit</div></div><div><div className="spec-cell__value">Unlimited</div><div className="spec-cell__note">Scale campaigns without artificial API request boundaries.</div></div></div>
            <div className="spec-cell"><div><div className="spec-cell__id">SP-06</div><div className="spec-cell__label">Meta Sandbox</div></div><div><div className="spec-cell__value">Active</div><div className="bar-track"><div className="bar-track__fill" style={{ width: '100%' }}></div></div></div></div>
            <div className="spec-cell spec-cell--dark"><div><div className="spec-cell__id">SP-07</div><div className="spec-cell__label">Webhook Retries</div></div><div><div className="spec-cell__value">Smart</div><div className="spec-cell__note">Automatic webhook retries using exponential backoff schedules.</div></div></div>
            <div className="spec-cell"><div><div className="spec-cell__id">SP-08</div><div className="spec-cell__label">API Ingress</div></div><div><div className="spec-cell__value">Secure</div><div className="spec-cell__note">IP whitelisting, rate limit shields, and full API auditing.</div></div></div>
          </div>
        </div>
      </section>

      {/* ====== TERMINAL LOG ====== */}
      <div className="log" aria-label="System telemetry">
        <div className="log__header">
          <div className="log__header-title">Live Gateway Telemetry Feed</div>
          <div className="log__header-status">Stream ID: WM-GW-847D</div>
        </div>
        <div className="log__body">
          <div className="log__track">
            <div className="log__entry"><span className="log__entry-time">12:10:01Z</span><span className="log__entry-tag log-ok">OK</span><span className="log__entry-msg">Message dispatched to +9199881122 — status: DELIVERED</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:02Z</span><span className="log__entry-tag log-sys">SYS</span><span className="log__entry-msg">Webhook triggered successfully — latency 12ms</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:04Z</span><span className="log__entry-tag log-ok">OK</span><span className="log__entry-msg">Chatbot triggered for user +1415993 — rule: keyword_help</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:05Z</span><span className="log__entry-tag log-warn">WARN</span><span className="log__entry-msg">Meta API throttle warning — scaling buffer up</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:07Z</span><span className="log__entry-tag log-sys">SYS</span><span className="log__entry-msg">Database sync completed — snapshot updated</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:08Z</span><span className="log__entry-tag log-ok">OK</span><span className="log__entry-msg">Template approved by Meta: campaign_promotional_v2</span></div>
          </div>
          <div className="log__track log__track--reverse">
            <div className="log__entry"><span className="log__entry-time">12:10:10Z</span><span className="log__entry-tag log-ok">OK</span><span className="log__entry-msg">Broadcast queue flushed — 4,800 messages cleared</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:12Z</span><span className="log__entry-tag log-sys">SYS</span><span className="log__entry-msg">Redis queue load normal — 0.02% queue occupancy</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:14Z</span><span className="log__entry-tag log-warn">WARN</span><span className="log__entry-msg">Webhook timeout for endpoint: https://api.crm.local/webhook</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:15Z</span><span className="log__entry-tag log-ok">OK</span><span className="log__entry-msg">Chat session created: session_8492014</span></div>
            <div className="log__entry"><span className="log__entry-time">12:10:18Z</span><span className="log__entry-tag log-ok">OK</span><span className="log__entry-msg">Message dispatched to +44770022 — status: READ</span></div>
          </div>
        </div>
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

export default ProductDetail;
