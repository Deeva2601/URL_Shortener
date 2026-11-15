import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import { formatNumber } from '../utils/formatters';
import { getAnalytics, getErrorMessage } from '../services/api';

function Breakdown({ title, items, total }) {
  return <section className="breakdown-panel"><div className="breakdown-title"><h3>{title}</h3><span>{items.length} TRACKED</span></div>{items.length ? items.slice(0, 6).map((item) => <div className="breakdown-row" key={item.name}><div className="breakdown-label"><span>{item.name}</span><b>{total ? Math.round((item.count / total) * 100) : 0}%</b></div><div className="progress-track"><span style={{ width: `${total ? Math.max((item.count / total) * 100, 2) : 0}%` }} /></div></div>) : <p className="muted-copy">No click data yet. Share your link to start seeing the signal.</p>}</section>;
}

export default function AnalyticsPage() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let timer;
    async function load() {
      try {
        const result = await getAnalytics(shortCode);
        if (active) {
          setData(result);
          setError('');
        }
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError));
      }
    }
    load();
    timer = window.setInterval(load, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [shortCode]);

  const deviceItems = data?.devices || [];
  const topDevice = deviceItems[0]?.name || '—';
  const topReferrer = data?.referrers?.[0]?.name || '—';
  const chartData = useMemo(() => {
    if (!data) return [];
    const days = new Map(data.dailyClicks.map((entry) => [entry.date, entry.clicks]));
    for (let offset = 13; offset >= 0; offset -= 1) {
      const day = new Date();
      day.setDate(day.getDate() - offset);
      const key = day.toISOString().slice(0, 10);
      if (!days.has(key)) days.set(key, 0);
    }
    return [...days].sort(([first], [second]) => first.localeCompare(second)).slice(-14).map(([date, clicks]) => ({ date, clicks }));
  }, [data]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(data.url.shortUrl);
      toast.success('LINK COPIED TO CLIPBOARD');
    } catch {
      toast.error('Clipboard access failed. Copy the link manually.');
    }
  }

  if (error && !data) return <main className="analytics-page page-width"><Link className="back-link" to="/"><ArrowLeft size={16} /> BACK TO LINKS</Link><div className="empty-state error-state">{error}</div></main>;
  if (!data) return <main className="analytics-page page-width"><div className="empty-state">LOADING TELEMETRY…</div></main>;

  return (
    <main className="analytics-page page-width">
      <Link className="back-link" to="/"><ArrowLeft size={16} /> BACK TO LINKS</Link>
      <section className="analytics-header">
        <div><p className="kicker"><Activity size={14} /> LIVE LINK TELEMETRY</p><h1>CLICK<br /><span>REPORT</span></h1><p className="analytics-destination">{data.url.originalUrl}</p></div>
        <div className="analytics-shortlink"><span className="mono-caption">TRACKING LINK</span><a href={data.url.shortUrl} target="_blank" rel="noreferrer">{data.url.shortUrl} <ArrowUpRight size={15} /></a><button type="button" className="secondary-button compact" onClick={copyLink}>COPY LINK</button></div>
      </section>
      {error && <p className="inline-error" role="alert">{error} Retrying automatically.</p>}
      <section className="kpi-grid">
        <article className="kpi-card kpi-primary"><span className="mono-caption">TOTAL CLICKS</span><strong>{formatNumber(data.totalClicks)}</strong><span className="kpi-foot"><MousePointer2 size={14} /> ALL-TIME SIGNAL</span></article>
        <article className="kpi-card"><span className="mono-caption">TOP REFERRER</span><strong className="kpi-text">{topReferrer}</strong><span className="kpi-foot">MOST TRAFFIC FROM</span></article>
        <article className="kpi-card"><span className="mono-caption">PRIMARY DEVICE</span><strong className="kpi-text">{topDevice}</strong><span className="kpi-foot">MOST USED DEVICE</span></article>
      </section>
      <section className="chart-panel">
        <div className="panel-heading"><div><p className="kicker">CLICK ACTIVITY</p><h2>THE DAILY SIGNAL</h2></div><span className="live-tag"><i /> REFRESHES EVERY 15 SEC</span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}><defs><linearGradient id="clickFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b66f5" stopOpacity={0.25} /><stop offset="95%" stopColor="#3b66f5" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e5e5e5" vertical={false} /><XAxis dataKey="date" tickFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} tick={{ fontSize: 10, fill: '#666', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={{ stroke: '#111' }} minTickGap={24} /><YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#666', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ border: '1px solid #111', borderRadius: 0, boxShadow: '3px 3px 0 #111', fontFamily: 'JetBrains Mono', fontSize: 11 }} labelFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString()} /><Area type="monotone" dataKey="clicks" stroke="#3b66f5" strokeWidth={3} fill="url(#clickFill)" activeDot={{ r: 5, stroke: '#111', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div>
      </section>
      <section className="breakdown-grid"><Breakdown title="DEVICE BREAKDOWN" items={data.devices} total={data.totalClicks} /><Breakdown title="BROWSER BREAKDOWN" items={data.browsers} total={data.totalClicks} /><Breakdown title="REFERRER BREAKDOWN" items={data.referrers} total={data.totalClicks} /></section>
    </main>
  );
}
