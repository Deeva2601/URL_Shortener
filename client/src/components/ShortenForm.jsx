import { useState } from 'react';
import { ArrowRight, Link2 } from 'lucide-react';
import { getErrorMessage, shortenUrl } from '../services/api';

const initialForm = { originalUrl: '', customAlias: '', expiration: '' };

export default function ShortenForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(event) {
    setError('');
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = await shortenUrl({
        originalUrl: form.originalUrl,
        customAlias: form.customAlias,
        expiration: form.expiration
      });
      setForm(initialForm);
      onCreated(url);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="shorten-form" id="shorten" onSubmit={submit}>
      <div className="form-topline"><span><Link2 size={15} /> LINK GENERATOR</span><span className="mono-caption">NO ACCOUNT REQUIRED</span></div>
      <label className="field-label" htmlFor="originalUrl">Destination URL</label>
      <input id="originalUrl" name="originalUrl" type="url" required maxLength={2048} placeholder="https://your-long-link.com/..." value={form.originalUrl} onChange={update} />
      <div className="form-options">
        <div className="alias-field">
          <label className="field-label" htmlFor="customAlias">Custom alias <span>OPTIONAL</span></label>
          <div className="alias-input"><span>/</span><input id="customAlias" name="customAlias" type="text" maxLength={60} placeholder="your-slug" value={form.customAlias} onChange={update} /></div>
        </div>
        <div className="expiry-field">
          <label className="field-label" htmlFor="expiration">Link expiration</label>
          <select id="expiration" name="expiration" value={form.expiration} onChange={update}>
            <option value="">Never</option><option value="24h">24 hours</option><option value="7d">7 days</option><option value="30d">30 days</option>
          </select>
        </div>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <button className="primary-button submit-button" type="submit" disabled={loading}>
        {loading ? 'CREATING LINK…' : <>SHORTEN URL <ArrowRight size={18} /></>}
      </button>
      <p className="form-note">Fast 302 redirects. Real-time click tracking. No signup friction.</p>
    </form>
  );
}
