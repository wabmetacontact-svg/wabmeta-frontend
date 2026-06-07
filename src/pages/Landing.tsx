import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'status' | 'pricing'>('home');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('--:--:-- UTC');

  // Observer Telemetry State
  const [stats, setStats] = useState({ cpu: '12%', mem: '4.2G', net: '840M' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [throughputHeights, setThroughputHeights] = useState<number[]>([]);

  // 1. Telemetry simulation & UTC Clock
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

  useEffect(() => {
    // Initialize throughput heights
    const heights = Array.from({ length: 30 }, () => 15 + Math.floor(Math.random() * 85));
    setThroughputHeights(heights);

    if (activeTab !== 'status') return;

    // Fluctuating stats timer
    const statsTimer = setInterval(() => {
      setStats({
        cpu: (8 + Math.random() * 18).toFixed(0) + '%',
        mem: (3.8 + Math.random() * 1.4).toFixed(1) + 'G',
        net: (700 + Math.random() * 400).toFixed(0) + 'M',
      });
    }, 2500);

    // Throughput chart timer
    const chartTimer = setInterval(() => {
      setThroughputHeights(Array.from({ length: 30 }, () => 15 + Math.floor(Math.random() * 85)));
    }, 3000);

    return () => {
      clearInterval(statsTimer);
      clearInterval(chartTimer);
    };
  }, [activeTab]);

  // 2. Dynamic Stylesheet Injection
  useEffect(() => {
    // Core stylesheet
    let coreLink = document.getElementById('axis-core-css') as HTMLLinkElement;
    if (!coreLink) {
      coreLink = document.createElement('link');
      coreLink.id = 'axis-core-css';
      coreLink.rel = 'stylesheet';
      coreLink.href = '/css/templatemo-axis-industrial.css';
      document.head.appendChild(coreLink);
    }

    // Tab-specific stylesheet
    let tabCssPath = '';
    if (activeTab === 'home' || activeTab === 'pricing') {
      tabCssPath = '/css/templatemo-axis-main-page.css';
    } else if (activeTab === 'features') {
      tabCssPath = '/css/templatemo-axis-landing-page.css';
    } else if (activeTab === 'status') {
      tabCssPath = '/css/templatemo-axis-the-observer.css';
    }

    let tabLink = document.getElementById('axis-tab-css') as HTMLLinkElement;
    if (tabLink) {
      tabLink.href = tabCssPath;
    } else {
      tabLink = document.createElement('link');
      tabLink.id = 'axis-tab-css';
      tabLink.rel = 'stylesheet';
      tabLink.href = tabCssPath;
      document.head.appendChild(tabLink);
    }

    // Adjust body styling
    document.body.style.backgroundColor = '#FFFFFF';
    document.body.style.fontFamily = "'JetBrains Mono', monospace";
    document.body.style.color = '#000000';

    return () => {
      // Dynamic cleanup only occurs when landing unmounts completely
    };
  }, [activeTab]);

  // Cleanup on final component unmount
  useEffect(() => {
    return () => {
      const coreLink = document.getElementById('axis-core-css');
      if (coreLink) coreLink.remove();
      const tabLink = document.getElementById('axis-tab-css');
      if (tabLink) tabLink.remove();

      document.body.style.backgroundColor = '';
      document.body.style.fontFamily = '';
      document.body.style.color = '';
    };
  }, []);

  // 3. Scroll Reveal Trigger
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
  }, [activeTab]);

  // Tab Content Renderers
  const renderHomeTab = () => {
    return (
      <>
        {/* ====== HERO ====== */}
        <section className="hero">
          <div className="hero__grid hero__grid--dense" aria-hidden="true"></div>
          <div className="hero__label reveal">Est. 2024 — WhatsApp Marketing Platform</div>
          <h1 className="hero__title">
            <span className="line">Built for</span>
            <span className="line line--indent">the Scale<span className="accent-dot">.</span></span>
          </h1>
          <div className="hero__bottom">
            <p className="hero__desc reveal">We engineer high-throughput broadcast systems that perform under extreme load, high volume, and zero tolerance for failure.</p>
            <div className="hero__stats reveal">
              <div><div className="hero__stat-num">12M<span className="accent">+</span></div><div className="hero__stat-label">Messages Sent</div></div>
              <div><div className="hero__stat-num">99.9<span className="accent">%</span></div><div className="hero__stat-label">Uptime Record</div></div>
              <div><div className="hero__stat-num">50<span className="accent">+</span></div><div className="hero__stat-label">Countries Served</div></div>
            </div>
          </div>
          <div className="hero__scroll-cue" aria-hidden="true">Scroll</div>
        </section>

        {/* ====== BENTO SPECS ====== */}
        <section className="section" id="specs">
          <div className="container">
            <div className="section__header reveal">
              <div className="section__eyebrow">// Core Capabilities</div>
              <h2 className="section__title">What We<br />Bring to Scale</h2>
            </div>
            <div className="bento__grid">
              <div className="bento-card bento-card--wide reveal">
                <div className="bento-card__number">WM—01</div>
                <div>
                  <h3 className="bento-card__title">Broadcast<br />Engine</h3>
                  <p className="bento-card__text">High-throughput message campaigns. Parallel queueing and smart routing dispatching millions of messages concurrently.</p>
                </div>
                <div className="bar-chart">
                  <div className="bar-chart__col" style={{ height: '45%' }}></div>
                  <div className="bar-chart__col" style={{ height: '70%' }}></div>
                  <div className="bar-chart__col" style={{ height: '55%' }}></div>
                  <div className="bar-chart__col" style={{ height: '90%' }}></div>
                  <div className="bar-chart__col" style={{ height: '65%' }}></div>
                  <div className="bar-chart__col" style={{ height: '100%' }}></div>
                  <div className="bar-chart__col" style={{ height: '80%' }}></div>
                  <div className="bar-chart__col" style={{ height: '95%' }}></div>
                </div>
              </div>

              <div className="bento-card bento-card--narrow bento-card--dark reveal">
                <div className="bento-card__number">WM—02</div>
                <h3 className="bento-card__title">Smart<br />Chatbots</h3>
                <div className="bento-card__stat">24/7</div>
              </div>

              <div className="bento-card bento-card--mid reveal">
                <div className="bento-card__number">WM—03</div>
                <div>
                  <h3 className="bento-card__title">Multi-Agent<br />Inbox</h3>
                  <p className="bento-card__text">Collaborative customer support. Labels, private internal notes, and quick replies keep your team aligned.</p>
                </div>
                <div style={{ alignSelf: 'end', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="tag">Shared</span>
                  <span className="tag tag--filled">Assigned</span>
                  <span className="tag">Tagged</span>
                </div>
              </div>

              <div className="bento-card bento-card--mid bento-card--safety reveal">
                <div className="bento-card__number" style={{ opacity: 0.6 }}>WM—04</div>
                <h3 className="bento-card__title">CRM &<br />API Automation</h3>
                <p className="bento-card__text" style={{ opacity: 0.85 }}>Integrate triggers, webhooks, and auto-syncing with your systems in minutes.</p>
                <div className="bento-card__stat">API</div>
              </div>

              <div className="bento-card bento-card--narrow bento-card--tall reveal">
                <div className="bento-card__number">WM—05</div>
                <h3 className="bento-card__title">Meta<br />Compliance</h3>
                <p className="bento-card__text">Official WhatsApp API integration. Green badge verification guidance and instant approval rates.</p>
                <div style={{ alignSelf: 'end' }}>
                  <div className="bento-card__stat">100<span className="accent" style={{ fontSize: '0.4em' }}>%</span></div>
                  <div className="bento-card__text" style={{ marginTop: '0.5rem' }}>Approval Rate</div>
                </div>
              </div>

              <div className="bento-card bento-card--wide bento-card--dark reveal">
                <div className="bento-card__number">WM—06</div>
                <div>
                  <h3 className="bento-card__title">Campaign<br />Analytics</h3>
                  <p className="bento-card__text" style={{ opacity: 0.55 }}>Track reads, replies, click-through rates, and message status logs in real-time.</p>
                </div>
                <div className="bar-chart">
                  <div className="bar-chart__col" style={{ height: '60%' }}></div>
                  <div className="bar-chart__col" style={{ height: '80%' }}></div>
                  <div className="bar-chart__col" style={{ height: '100%' }}></div>
                  <div className="bar-chart__col" style={{ height: '70%' }}></div>
                  <div className="bar-chart__col" style={{ height: '90%' }}></div>
                  <div className="bar-chart__col" style={{ height: '50%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== TICKER ====== */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker__track">
            <span className="ticker__item">WhatsApp Broadcasts</span>
            <span className="ticker__item">Multi-Agent Shared Inbox</span>
            <span className="ticker__item">Smart Chatbots</span>
            <span className="ticker__item">Automated Campaigns</span>
            <span className="ticker__item">CRM Integration</span>
            <span className="ticker__item">Real-Time Analytics</span>
            <span className="ticker__item">API Webhooks</span>
            <span className="ticker__item">Meta Verified</span>
            <span className="ticker__item">WhatsApp Broadcasts</span>
            <span className="ticker__item">Multi-Agent Shared Inbox</span>
            <span className="ticker__item">Smart Chatbots</span>
            <span className="ticker__item">Automated Campaigns</span>
            <span className="ticker__item">CRM Integration</span>
            <span className="ticker__item">Real-Time Analytics</span>
            <span className="ticker__item">API Webhooks</span>
            <span className="ticker__item">Meta Verified</span>
          </div>
        </div>
        <div className="ticker ticker--reverse ticker--safety" aria-hidden="true">
          <div className="ticker__track">
            <span className="ticker__item">Built to Scale</span>
            <span className="ticker__item">Zero Compromise</span>
            <span className="ticker__item">WabMeta Platform</span>
            <span className="ticker__item">Engineered Speed</span>
            <span className="ticker__item">On Time — On Spec</span>
            <span className="ticker__item">WabMeta Platform</span>
            <span className="ticker__item">Built to Scale</span>
            <span className="ticker__item">Zero Compromise</span>
            <span className="ticker__item">WabMeta Platform</span>
            <span className="ticker__item">Engineered Speed</span>
            <span className="ticker__item">On Time — On Spec</span>
            <span className="ticker__item">WabMeta Platform</span>
          </div>
        </div>

        {/* ====== PROCESS ====== */}
        <section className="section" id="process">
          <div className="container">
            <div className="stack__header reveal">
              <div>
                <div className="section__eyebrow">// How We Work</div>
                <h2 className="section__title">The Process</h2>
              </div>
              <p className="stack__subtitle">Four phases. One outcome. Scalable WhatsApp communication that grows your business.</p>
            </div>
            <div>
              <article className="stack__card reveal">
                <div className="stack__card-left"><div className="stack__card-step">01</div></div>
                <div className="stack__card-right">
                  <h3 className="stack__card-title">Setup &<br />Connect</h3>
                  <p className="stack__card-text">Connect your WhatsApp Business API profile. Setup takes minutes with our embedded signup flow.</p>
                  <div className="stack__card-tags">
                    <span className="tag">API Link</span>
                    <span className="tag">Meta Onboard</span>
                    <span className="tag tag--filled">Quick Ready</span>
                  </div>
                </div>
              </article>
              <article className="stack__card reveal">
                <div className="stack__card-left"><div className="stack__card-step">02</div></div>
                <div className="stack__card-right">
                  <h3 className="stack__card-title">Design &<br />Verify</h3>
                  <p className="stack__card-text">Create high-converting templates with buttons, headers, and custom variables, ready for Meta's approval.</p>
                  <div className="stack__card-tags">
                    <span className="tag">Rich Media</span>
                    <span className="tag tag--safety">Parameters</span>
                    <span className="tag">Quick Approval</span>
                  </div>
                </div>
              </article>
              <article className="stack__card reveal">
                <div className="stack__card-left"><div className="stack__card-step">03</div></div>
                <div className="stack__card-right">
                  <h3 className="stack__card-title">Broadcast<br />& Automate</h3>
                  <p className="stack__card-text">Trigger high-volume campaigns, set up auto-replies, or connect API webhooks to dispatch alerts automatically.</p>
                  <div className="stack__card-tags">
                    <span className="tag tag--filled">Broadcasts</span>
                    <span className="tag">Chatbots</span>
                    <span className="tag">API Webhooks</span>
                  </div>
                </div>
              </article>
              <article className="stack__card reveal">
                <div className="stack__card-left"><div className="stack__card-step">04</div></div>
                <div className="stack__card-right">
                  <h3 className="stack__card-title">Analyze &<br />Optimize</h3>
                  <p className="stack__card-text">Monitor delivery tracking logs, read receipts, response rates, and sales conversions in real-time.</p>
                  <div className="stack__card-tags">
                    <span className="tag">Live Logs</span>
                    <span className="tag">ROI Analytics</span>
                    <span className="tag tag--safety">Subscribers</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </>
    );
  };

  const renderFeaturesTab = () => {
    return (
      <>
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
      </>
    );
  };

  const renderStatusTab = () => {
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
    );
  };

  const renderPricingTab = () => {
    return (
      <section className="section" id="pricing" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="container">
          <div className="section__header reveal" style={{ textAlign: 'center' }}>
            <div className="section__eyebrow">// Transparency Policy</div>
            <h2 className="section__title">Pricing Plans<br />Built for Growth</h2>
            <p className="hero__desc" style={{ margin: '1.5rem auto 0 auto', opacity: 0.55 }}>Pick a plan that fits your volume. Upgrade, downgrade, or cancel anytime. No hidden fees.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            {/* Starter Plan */}
            <div className="bento-card reveal" style={{ gridTemplateRows: 'auto 1fr auto', minHeight: '450px' }}>
              <div className="bento-card__number">PLAN // 01</div>
              <div>
                <h3 className="bento-card__title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Starter</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 750, fontFamily: "'Space Grotesk', sans-serif" }}>$49</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>/ month</span>
                </div>
                <p className="bento-card__text" style={{ marginBottom: '1.5rem', opacity: 0.7 }}>Perfect for small businesses starting out with basic campaigns.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div>✓ 10,000 Messages/month</div>
                  <div>✓ 3 Agent Shared Inbox</div>
                  <div>✓ Basic Campaign Analytics</div>
                  <div>✓ Standard Webhook API</div>
                  <div>✓ Meta API Setup Assistance</div>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Link to="/signup?plan=starter" className="btn btn--ghost" style={{ width: '100%' }}>Choose Starter</Link>
              </div>
            </div>

            {/* Growth Plan */}
            <div className="bento-card bento-card--dark reveal" style={{ gridTemplateRows: 'auto 1fr auto', minHeight: '450px' }}>
              <div className="bento-card__number" style={{ opacity: 0.6 }}>PLAN // 02 — RECOMMENDED</div>
              <div>
                <h3 className="bento-card__title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Growth</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 750, fontFamily: "'Space Grotesk', sans-serif" }}>$99</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>/ month</span>
                </div>
                <p className="bento-card__text" style={{ marginBottom: '1.5rem', opacity: 0.85 }}>Built for growing teams needing automated campaigns and chatbots.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div>✓ 50,000 Messages/month</div>
                  <div>✓ 10 Agent Shared Inbox</div>
                  <div>✓ Advanced Automation & Rules</div>
                  <div>✓ Smart Chatbots & Keywords</div>
                  <div>✓ Priority Webhook Dispatches</div>
                  <div>✓ 24/7 Priority Support</div>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Link to="/signup?plan=growth" className="btn btn--primary" style={{ width: '100%' }}>Choose Growth</Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bento-card reveal" style={{ gridTemplateRows: 'auto 1fr auto', minHeight: '450px' }}>
              <div className="bento-card__number">PLAN // 03</div>
              <div>
                <h3 className="bento-card__title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Enterprise</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 750, fontFamily: "'Space Grotesk', sans-serif" }}>Custom</span>
                </div>
                <p className="bento-card__text" style={{ marginBottom: '1.5rem', opacity: 0.7 }}>Designed for high-volume enterprises with custom pipeline requirements.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div>✓ Unlimited Messages</div>
                  <div>✓ Unlimited Shared Inboxes</div>
                  <div>✓ Dedicated Routing Server</div>
                  <div>✓ Custom CRM & Database Sync</div>
                  <div>✓ Custom SLA & Compliance</div>
                  <div>✓ Dedicated Success Manager</div>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Link to="/contact" className="btn btn--ghost" style={{ width: '100%' }}>Contact Sales</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* ====== HEADER ====== */}
      <header className="header">
        <div className="header__inner">
          <div className="header__left">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
              className="header__logo"
              aria-label="WabMeta Home"
            >
              <span className="header__logo-mark">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#FF3E00" strokeWidth="2.5" />
                  <line x1="12" y1="2" x2="12" y2="22" stroke="#FF3E00" strokeWidth="2" />
                </svg>
              </span>
              WabMeta
            </a>
            <span className="header__sep"></span>
            <span className="header__product">WhatsApp SaaS</span>
          </div>

          <nav className={`header__nav ${isMobileNavOpen ? 'open' : ''}`} id="headerNav">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab('home'); setIsMobileNavOpen(false); }}
              className={activeTab === 'home' ? 'active' : ''}
            >
              Home
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab('features'); setIsMobileNavOpen(false); }}
              className={activeTab === 'features' ? 'active' : ''}
            >
              Features
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab('status'); setIsMobileNavOpen(false); }}
              className={activeTab === 'status' ? 'active' : ''}
            >
              Live Status
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab('pricing'); setIsMobileNavOpen(false); }}
              className={activeTab === 'pricing' ? 'active' : ''}
            >
              Pricing
            </a>
            <Link to="/documentation" onClick={() => setIsMobileNavOpen(false)}>Docs</Link>
            <Link to="/contact" onClick={() => setIsMobileNavOpen(false)}>Contact</Link>
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

      {/* ====== TAB CONTENT ====== */}
      <div style={{ flex: 1, paddingTop: 'var(--header-h)' }}>
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'features' && renderFeaturesTab()}
        {activeTab === 'status' && renderStatusTab()}
        {activeTab === 'pricing' && renderPricingTab()}
      </div>

      {/* ====== FOOTER ====== */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__top">
            <div className="footer__brand">
              <h2 className="font-display footer__brand-name">Wab<br />Meta<span className="accent">.</span></h2>
              <p className="footer__brand-desc">Engineered WhatsApp broadcast pipelines. Auto chatbots. Shared multi-agent inbox — designed for high-scale environments.</p>
            </div>
            <div className="footer__col">
              <div className="footer__col-title">Capabilities</div>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('features'); }}>Campaigns</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('features'); }}>Chatbots</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('status'); }}>Live Status</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('pricing'); }}>Pricing</a>
            </div>
            <div className="footer__col">
              <div className="footer__col-title">Resources</div>
              <Link to="/documentation">API Docs</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/contact">Support Help</Link>
            </div>
            <div className="footer__col">
              <div className="footer__col-title">Get in Touch</div>
              <a href="mailto:hello@wabmeta.com">hello@wabmeta.com</a>
              <a href="tel:+13125550190">+1 (312) 555-0190</a>
              <span>San Francisco, CA — USA</span>
            </div>
          </div>
          <div className="footer__bottom">
            <span className="footer__copy">&copy; 2026 WabMeta. &nbsp;|&nbsp; Designed in the style of Axis Industrial</span>
            <button className="footer__back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to Top</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;