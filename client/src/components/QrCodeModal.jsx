import { useRef } from 'react';
import { Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrCodeModal({ url, onClose }) {
  const qrRef = useRef(null);

  function download() {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const anchor = document.createElement('a');
    anchor.download = `contextpack-${url.shortCode}-qr.png`;
    anchor.href = canvas.toDataURL('image/png');
    anchor.click();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close QR code"><X size={20} /></button>
        <p className="kicker">OFFLINE / SHARE READY</p>
        <h2 id="qr-title">SCAN THE LINK</h2>
        <div className="qr-frame" ref={qrRef}><QRCodeCanvas value={url.shortUrl} size={220} level="H" includeMargin /></div>
        <p className="qr-url">{url.shortUrl}</p>
        <button className="primary-button qr-download" onClick={download} type="button"><Download size={17} /> DOWNLOAD PNG</button>
      </section>
    </div>
  );
}
