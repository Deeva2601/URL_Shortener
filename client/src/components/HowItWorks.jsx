import { Activity, ArrowUpRight, Link2 } from 'lucide-react';

const steps = [
  { number: '01', icon: Link2, title: 'DROP YOUR URL', text: 'Paste a destination. Add a custom alias or let us make a clean one.' },
  { number: '02', icon: ArrowUpRight, title: 'SHARE EVERYWHERE', text: 'One short link, ready to copy, scan, and put in front of your audience.' },
  { number: '03', icon: Activity, title: 'READ THE SIGNAL', text: 'Track clicks, referrers, devices, and browsers as they happen.' }
];

export default function HowItWorks() {
  return (
    <section className="how-section page-width" id="how-it-works">
      <div className="section-heading"><div><p className="kicker">A SMALL LINK. A BIGGER PICTURE.</p><h2>HOW IT<br /><span>WORKS</span></h2></div><p className="section-aside">Three moves from too-long to fully tracked. Built for launches, creators, and the curious.</p></div>
      <div className="steps-grid">{steps.map(({ number, icon: Icon, title, text }) => <article className="step-card" key={number}><span className="step-number">{number}</span><Icon size={22} strokeWidth={1.8} /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
  );
}
