import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('--:--:-- UTC');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

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
      tabLink.href = '/css/templatemo-axis-main-page.css';
    } else {
      tabLink = document.createElement('link');
      tabLink.id = 'axis-tab-css';
      tabLink.rel = 'stylesheet';
      tabLink.href = '/css/templatemo-axis-main-page.css';
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
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#2883CF" strokeWidth="2.5" />
                  <line x1="12" y1="2" x2="12" y2="22" stroke="#2883CF" strokeWidth="2" />
                </svg>
              </span>
              WabMeta
            </Link>
            <span className="header__sep"></span>
            <span className="header__product">Corporate</span>
          </div>

          <nav className={`header__nav ${isMobileNavOpen ? 'open' : ''}`} id="headerNav">
            <Link to="/" className="active">Home</Link>
            <Link to="/product">Features</Link>
            <Link to="/observer">Live Status</Link>
            <a href="#specs">Specs</a>
            <a href="#process">Process</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Reviews</a>
            <a href="#faq">FAQ</a>
            <a href="#team">Team</a>
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

      {/* ====== PRICING ====== */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="section__header reveal">
            <div className="section__eyebrow">// Subscription Tiers</div>
            <h2 className="section__title">Select Your<br />Scale</h2>
          </div>
          <div className="bento__grid">
            {/* Plan 1: Free Demo */}
            <div className="bento-card bento-card--narrow reveal">
              <div className="bento-card__number">WM—PR01</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="bento-card__title">Free Demo</h3>
                  <div className="bento-card__stat" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Free</div>
                  <p className="bento-card__text" style={{ marginBottom: '1.5rem' }}>2 Days access to test the waters.</p>
                  <ul style={{ fontSize: '0.8rem', marginBottom: '1.5rem', opacity: 0.85, paddingLeft: '0.5rem', listStyle: 'none' }}>
                    <li style={{ marginBottom: '0.5rem' }}>[+] 100 Messages Limit</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Basic Campaigns</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Number Safety Tool</li>
                    <li style={{ marginBottom: '0.5rem', opacity: 0.45 }}>[-] No Automation Flows</li>
                    <li style={{ marginBottom: '0.5rem', opacity: 0.45 }}>[-] No Webhook Triggers</li>
                  </ul>
                </div>
                <Link to="/signup" className="btn btn--ghost" style={{ width: '100%', marginTop: 'auto' }}>Start Free</Link>
              </div>
            </div>

            {/* Plan 2: Monthly */}
            <div className="bento-card bento-card--narrow reveal">
              <div className="bento-card__number">WM—PR02</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="bento-card__title">Monthly</h3>
                  <div className="bento-card__stat" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>₹899<span style={{ fontSize: '0.45em', opacity: 0.6 }}>/mo</span></div>
                  <p className="bento-card__text" style={{ marginBottom: '1.5rem' }}>Ideal for growing businesses.</p>
                  <ul style={{ fontSize: '0.8rem', marginBottom: '1.5rem', opacity: 0.85, paddingLeft: '0.5rem', listStyle: 'none' }}>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Unlimited Messages*</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Unlimited Campaigns</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Standard Safety Shields</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Flow Builder & Webhooks</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Email & Chat Support</li>
                  </ul>
                </div>
                <Link to="/signup" className="btn btn--primary" style={{ width: '100%', marginTop: 'auto' }}>Get Started</Link>
              </div>
            </div>

            {/* Plan 3: 3-Month */}
            <div className="bento-card bento-card--narrow reveal">
              <div className="bento-card__number">WM—PR03</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="bento-card__title">3-Month</h3>
                  <div className="bento-card__stat" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>₹2,500<span style={{ fontSize: '0.35em', textDecoration: 'line-through', opacity: 0.4, marginLeft: '0.5rem' }}>₹2.6K</span></div>
                  <p className="bento-card__text" style={{ marginBottom: '1.5rem' }}>Quarterly saver plan.</p>
                  <ul style={{ fontSize: '0.8rem', marginBottom: '1.5rem', opacity: 0.85, paddingLeft: '0.5rem', listStyle: 'none' }}>
                    <li style={{ marginBottom: '0.5rem' }}>[+] All Monthly Features</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Basic Automation Suite</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Enhanced Safety Features</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Standard Support Channel</li>
                    <li style={{ marginBottom: '0.5rem', opacity: 0.45 }}>[-] No Auto-Retry Queue</li>
                  </ul>
                </div>
                <Link to="/signup" className="btn btn--ghost" style={{ width: '100%', marginTop: 'auto' }}>Choose 3-Mo</Link>
              </div>
            </div>

            {/* Plan 4: 6-Month (Popular - Dark Theme) */}
            <div className="bento-card bento-card--mid bento-card--dark reveal">
              <div className="bento-card__number" style={{ color: 'var(--safety)' }}>WM—PR04 [POPULAR]</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="bento-card__title">6-Month Saver</h3>
                  <div className="bento-card__stat" style={{ fontSize: '3rem', marginBottom: '1rem' }}>₹5,000<span style={{ fontSize: '0.35em', textDecoration: 'line-through', opacity: 0.5, marginLeft: '0.5rem' }}>₹5.3K</span></div>
                  <p className="bento-card__text" style={{ opacity: 0.75, marginBottom: '1.5rem' }}>Our most chosen plan for business operations.</p>
                  <ul style={{ fontSize: '0.8rem', marginBottom: '1.5rem', paddingLeft: '0.5rem', listStyle: 'none' }}>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Advanced Automations & Chatbots</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Same Mobile + API Account Link</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Automated Campaign Retry Queue</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] High-safety Dispatch Shield</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Priority Support Channel (WhatsApp)</li>
                  </ul>
                </div>
                <Link to="/signup" className="btn btn--primary" style={{ width: '100%', borderColor: 'var(--safety)', marginTop: 'auto' }}>Get Best Value</Link>
              </div>
            </div>

            {/* Plan 5: 1-Year (Best Deal - Safety Theme) */}
            <div className="bento-card bento-card--mid bento-card--safety reveal">
              <div className="bento-card__number" style={{ opacity: 0.8 }}>WM—PR05 [BEST DEAL]</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="bento-card__title">1-Year Annual</h3>
                  <div className="bento-card__stat" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--base)' }}>₹8,999<span style={{ fontSize: '0.35em', textDecoration: 'line-through', opacity: 0.7, marginLeft: '0.5rem' }}>₹10.7K</span></div>
                  <p className="bento-card__text" style={{ color: 'var(--base)', opacity: 0.9, marginBottom: '1.5rem' }}>Ultimate value package for serious scale.</p>
                  <ul style={{ fontSize: '0.8rem', marginBottom: '1.5rem', paddingLeft: '0.5rem', listStyle: 'none' }}>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Complete Automation & Rule Engine</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Link 2 Separate WhatsApp Accounts</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] High-throughput Dispatch Cluster</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Maximum Account Anti-ban Safety</li>
                    <li style={{ marginBottom: '0.5rem' }}>[+] Direct Founder Escalation Support</li>
                  </ul>
                </div>
                <Link to="/signup" className="btn btn--ghost" style={{ width: '100%', color: 'var(--ink)', background: 'var(--base)', marginTop: 'auto' }}>Go Annual</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="section section--surface" id="testimonials">
        <div className="container">
          <div className="section__header reveal">
            <div className="section__eyebrow">// Customer Telemetry</div>
            <h2 className="section__title">Verified<br />Feedback</h2>
          </div>
          <div className="bento__grid">
            <div className="bento-card bento-card--mid reveal">
              <div className="bento-card__number">TE—01 / Priya Sharma</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <p className="bento-card__text" style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--ink)', opacity: 0.9, marginBottom: '1.5rem' }}>
                  "We were burning ₹40K/month on SaaS platforms. WabMeta replaced 3 tools, and our response rate went up 40%. The campaign tools save us 20 hours/week."
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.65, marginTop: 'auto' }}>
                  <span>TechStart India (Marketing)</span>
                  <span className="accent">★ 5.0 rating</span>
                </div>
              </div>
            </div>

            <div className="bento-card bento-card--mid reveal">
              <div className="bento-card__number">TE—02 / Rahul Verma</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <p className="bento-card__text" style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--ink)', opacity: 0.9, marginBottom: '1.5rem' }}>
                  "Set up our entire support automation in one afternoon. The chatbot editor is so intuitive that our non-tech team members built half of the responses."
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.65, marginTop: 'auto' }}>
                  <span>QuickCommerce (CEO)</span>
                  <span className="accent">★ 5.0 rating</span>
                </div>
              </div>
            </div>

            <div className="bento-card bento-card--mid reveal">
              <div className="bento-card__number">TE—03 / Anjali Patel</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <p className="bento-card__text" style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--ink)', opacity: 0.9, marginBottom: '1.5rem' }}>
                  "Tried 4 platforms before this. WabMeta is the only one where real-time analytics are actually precise. Their support resolved an issue on Sunday in 12 min."
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.65, marginTop: 'auto' }}>
                  <span>FoodExpress (Ops Head)</span>
                  <span className="accent">★ 5.0 rating</span>
                </div>
              </div>
            </div>

            <div className="bento-card bento-card--mid reveal">
              <div className="bento-card__number">TE—04 / Vikram Singh</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <p className="bento-card__text" style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--ink)', opacity: 0.9, marginBottom: '1.5rem' }}>
                  "Managing thousands of parent queries is tough. The multi-agent shared inbox, internal notes, and tagging system are exactly what our edtech team needed."
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.65, marginTop: 'auto' }}>
                  <span>EduLearn (Founder)</span>
                  <span className="accent">★ 5.0 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TEAM ====== */}
      <section className="section" id="team">
        <div className="container">
          <div className="section__header reveal">
            <div className="section__eyebrow">// Leadership</div>
            <h2 className="section__title">Core<br />Engineers</h2>
          </div>
          <div className="bento__grid">
            <div className="bento-card bento-card--mid reveal">
              <div className="bento-card__number">AV—01 / CEO & CO-FOUNDER</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="bento-card__title">Ankit Verma</h3>
                  <p className="bento-card__text" style={{ marginBottom: '1.5rem' }}>
                    Built and scaled multiple SaaS projects. Expert in WhatsApp API compliance and business automation pathways. Handles vision, customer success, and sales strategy.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    <span className="tag">Strategy</span>
                    <span className="tag tag--filled">Sales</span>
                    <span className="tag">Product</span>
                  </div>
                </div>
                <a href="mailto:ankit@wabmeta.com" className="btn btn--ghost" style={{ alignSelf: 'start', width: '100%', marginTop: 'auto' }}>Contact Ankit</a>
              </div>
            </div>

            <div className="bento-card bento-card--mid reveal">
              <div className="bento-card__number">ST—02 / CTO & CO-FOUNDER</div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="bento-card__title">Samir Thakur</h3>
                  <p className="bento-card__text" style={{ marginBottom: '1.5rem' }}>
                    Full-stack system architect focusing on high-throughput queue optimization and API reliability. Writes clean code, scales infrastructure, and ensures 99.9% uptime.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    <span className="tag">NodeJS</span>
                    <span className="tag tag--filled">React</span>
                    <span className="tag">Infra</span>
                  </div>
                </div>
                <a href="https://github.com/Samir-Thakur" target="_blank" rel="noopener noreferrer" className="btn btn--primary" style={{ alignSelf: 'start', width: '100%', marginTop: 'auto' }}>Github Profile</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="section section--surface" id="faq">
        <div className="container">
          <div className="section__header reveal">
            <div className="section__eyebrow">// Inquiries</div>
            <h2 className="section__title">Frequently<br />Asked</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            {[
              {
                q: "What is WabMeta and how does it work?",
                a: "WabMeta is an official WhatsApp Business platform built on Meta's official Cloud API. We handle the complex API integration and provide an easy-to-use interface for broadcasting campaigns, setting up chatbot flows, and managing multi-agent support in a shared inbox."
              },
              {
                q: "Do I need a WhatsApp Business Account?",
                a: "Yes. If you do not have one yet, our signup flow walks you through creating it in about 5 minutes. You will need a clean phone number that is not currently active on a personal WhatsApp account."
              },
              {
                q: "How much does it cost to send messages?",
                a: "There are two parts: WabMeta's platform subscription fee (starting with our Free Demo, up to our ₹899/month saver plan) and Meta's official conversation fees. We do not markup Meta's official pricing — you pay them directly."
              },
              {
                q: "Can I import my existing contacts?",
                a: "Yes. You can import contacts via CSV or Excel uploads. Our platform auto-validates phone numbers, formats international codes, and lets you add custom tags to segment your lists for broadcast targeting."
              },
              {
                q: "How secure is my data?",
                a: "Your data is fully secure. All communication is encrypted in transit via TLS 1.3 and at rest via AES-256. We host our databases in secure cloud clusters with regular backups and respect GDPR compliance guidelines."
              }
            ].map((faq, index) => {
              const isOpen = activeFaqIndex === index;
              return (
                <div 
                  key={index} 
                  style={{ 
                    border: 'var(--border)', 
                    background: 'var(--base)', 
                    padding: '1.2rem',
                    boxShadow: isOpen ? 'var(--shadow-safety)' : 'var(--shadow)',
                    transition: 'box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontClass: 'font-display', fontSize: '1.1rem', margin: 0, textTransform: 'uppercase' }}>
                      {index + 1}. {faq.q}
                    </h3>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{isOpen ? '[-]' : '[+]'}</span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '1rem', borderTop: 'var(--border-hair)', paddingTop: '1rem', opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
              <Link to="/product">Features</Link>
              <Link to="/observer">Live Status</Link>
              <a href="#pricing">Pricing Plans</a>
              <a href="#testimonials">Reviews</a>
              <a href="#faq">FAQs</a>
              <a href="#team">Our Team</a>
              <Link to="/contact">Support Help</Link>
            </div>
            <div className="footer__col">
              <div className="footer__col-title">Resources</div>
              <Link to="/documentation">API Docs</Link>
              <Link to="/blog">Blog</Link>
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