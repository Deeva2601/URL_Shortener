import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="brand" to="/" aria-label="Contextpack home">
          <span className="brand-mark"><span /><i /></span>
          <span>Contextpack</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="/#how-it-works">How it works</a>
          <a href="/#links">Analytics</a>
          <a className="product-link" href="https://www.producthunt.com/" target="_blank" rel="noreferrer">Product Hunt <ArrowUpRight size={13} /></a>
        </nav>
      </div>
    </header>
  );
}
