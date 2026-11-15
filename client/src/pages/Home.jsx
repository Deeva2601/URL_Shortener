import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRight, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import LinkCard from '../components/LinkCard';
import ShortenForm from '../components/ShortenForm';
import { getBatchUrls, getErrorMessage } from '../services/api';

const STORAGE_KEY = 'contextpack-short-codes';

function readCodes() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter((code) => typeof code === 'string').slice(0, 100) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const codes = readCodes();
    if (!codes.length) {
      setUrls([]);
      setLoading(false);
      return;
    }
    try {
      const latest = await getBatchUrls(codes);
      setUrls(latest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latest.map((url) => url.shortCode)));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function handleCreated(url) {
    const codes = [...new Set([url.shortCode, ...readCodes()])].slice(0, 100);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch {
      toast.error('Link created, but this browser could not save it for later.');
    }
    setUrls((current) => [url, ...current.filter((item) => item.shortCode !== url.shortCode)]);
    toast.success('YOUR SMART LINK IS READY');
    document.getElementById('links')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <Hero />
      <main>
        <section className="create-section page-width">
          <div className="create-intro"><p className="kicker">YOUR NEXT LINK STARTS HERE</p><h2>SHORTEN.<br /><span>THEN KNOW.</span></h2><p>Every share deserves a signal. Create yours in seconds.</p></div>
          <ShortenForm onCreated={handleCreated} />
        </section>
        <section className="links-section page-width" id="links">
          <div className="section-title-row"><div><p className="kicker"><Activity size={14} /> YOUR LINK TELEMETRY</p><h2>THE SIGNAL BOARD</h2></div><span className="live-tag"><i /> LOCAL LINKS</span></div>
          {loading ? <div className="empty-state"><LoaderCircle className="spin" /> SYNCING LINKS…</div> : urls.length ? <div className="links-list">{urls.map((url) => <LinkCard key={url.shortCode} url={url} />)}</div> : <div className="empty-state"><p>No links in your signal board yet.</p><a href="#shorten">Create your first link <ArrowRight size={16} /></a></div>}
        </section>
        <HowItWorks />
      </main>
      <footer className="site-footer page-width"><a className="brand" href="/"><span className="brand-mark"><span /><i /></span><span>Contextpack</span></a><span>LINKS BUILT FOR THE NEXT CLICK.</span><span>© {new Date().getFullYear()} CONTEXTPACK</span></footer>
    </>
  );
}
