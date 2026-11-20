const features = [
  { number: "01", title: "Daily check-in", detail: "Your daily rewards will live here." },
  { number: "02", title: "Mystery boxes", detail: "A first look at the BOX EARN experience." },
  { number: "03", title: "Tasks & referrals", detail: "Your earning activities will appear here." }
];

export default function App() {
  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="BOX EARN home">
          <span className="brand-mark"><span /></span>
          <span>BOX<span className="brand-accent">EARN</span></span>
        </a>
        <span className="phase-pill"><i /> FOUNDATION PHASE</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR NEXT REWARD STARTS HERE</p>
        <h1>Earn more.<br /><span>Expect the unexpected.</span></h1>
        <p className="hero-copy">
          Welcome to BOX EARN — a new reward experience is taking shape.
          Your personal earning dashboard is coming soon.
        </p>
        <div className="hero-actions">
          <span className="status-dot" />
          <span>Platform foundation is being prepared</span>
        </div>
      </section>

      <section className="preview-card" aria-label="Dashboard preview">
        <div className="card-topline">
          <span className="card-label">YOUR OVERVIEW</span>
          <span className="preview-tag">PREVIEW</span>
        </div>
        <div className="balance-label">Available balance</div>
        <div className="balance-value">$<span>—</span><small> USDT</small></div>
        <div className="balance-foot">Your verified balance will appear here</div>
        <div className="card-divider" />
        <div className="mini-stats">
          <div><span>MY BOXES</span><strong>—</strong></div>
          <div><span>REFERRALS</span><strong>—</strong></div>
          <div><span>TASKS</span><strong>—</strong></div>
        </div>
        <div className="card-glow" aria-hidden="true" />
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <span className="eyebrow">THE EXPERIENCE</span>
          <span className="section-line" />
        </div>
        <div className="feature-list">
          {features.map((feature) => (
            <article className="feature-row" key={feature.number}>
              <span className="feature-number">{feature.number}</span>
              <div><h2>{feature.title}</h2><p>{feature.detail}</p></div>
              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <span className="footer-mark">BOX EARN</span>
        <span>Built for the next reward.</span>
      </footer>
    </main>
  );
}
