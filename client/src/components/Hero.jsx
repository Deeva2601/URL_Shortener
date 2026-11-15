import { Activity, ArrowUpRight, Link2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero page-width">
      <div className="hero-copy">
        <p className="kicker"><span>&gt;_</span> Instant link telemetry for creators</p>
        <h1>Turn any long URL<br />into trackable<br /><span>smart links</span></h1>
        <p className="hero-description">Make every character count. Create sharp, memorable links and see what happens after the click.</p>
        <a className="text-link" href="#shorten">Build your first link <ArrowUpRight size={16} /></a>
      </div>
      <div className="blueprint-wrap" aria-label="Link telemetry ready illustration">
        <div className="blueprint-card">
          <div className="blueprint-grid" />
          <div className="wire wire-one" />
          <div className="wire wire-two" />
          <div className="blueprint-content">
            <div className="blueprint-icon"><Link2 size={37} /><Activity size={21} /></div>
            <span className="mono-label">LINK TELEMETRY // READY</span>
            <div className="blueprint-spark"><i /><i /><i /><i /><i /><i /><i /></div>
            <span className="blueprint-foot">LIVE SIGNAL <b /></span>
          </div>
        </div>
        <span className="blueprint-index">FIG. 001 / LINK SYSTEM</span>
      </div>
    </section>
  );
}
