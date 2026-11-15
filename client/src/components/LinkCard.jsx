import { useState } from 'react';
import { ArrowUpRight, Check, Copy, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDate, truncate } from '../utils/formatters';
import QrCodeModal from './QrCodeModal';

export default function LinkCard({ url }) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success('LINK COPIED TO CLIPBOARD');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Clipboard access failed. Copy the link manually.');
    }
  }

  return (
    <>
      <article className="link-card">
        <div className="link-card-heading">
          <div>
            <span className="mono-caption">SHORT LINK</span>
            <a className="short-url" href={url.shortUrl} target="_blank" rel="noreferrer">{url.shortUrl}<ArrowUpRight size={14} /></a>
          </div>
          <div className="click-badge"><strong>{url.totalClicks.toLocaleString()}</strong><span>CLICKS</span></div>
        </div>
        <p className="original-url"><span className="mono-caption">DESTINATION</span>{truncate(url.originalUrl, 76)}</p>
        <div className="link-card-bottom">
          <span className="link-meta">{url.isCustom ? 'CUSTOM ALIAS' : 'SHORT LINK'} <i /> {url.expiresAt ? `EXPIRES ${formatDate(url.expiresAt)}` : 'NO EXPIRATION'}</span>
          <div className="card-actions">
            <button type="button" className="secondary-button compact" onClick={copyLink}>{copied ? <Check size={15} /> : <Copy size={15} />} COPY</button>
            <button type="button" className="secondary-button compact" onClick={() => setShowQr(true)}><QrCode size={15} /> QR</button>
            <Link className="primary-button compact" to={`/analytics/${encodeURIComponent(url.shortCode)}`}>VIEW TELEMETRY <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </article>
      {showQr && <QrCodeModal url={url} onClose={() => setShowQr(false)} />}
    </>
  );
}
