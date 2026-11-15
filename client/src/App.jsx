import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';

const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics/:shortCode" element={<Suspense fallback={<main className="analytics-page page-width"><div className="empty-state">LOADING TELEMETRY…</div></main>}><AnalyticsPage /></Suspense>} />
        <Route path="*" element={<main className="page-width not-found"><p className="kicker">404 // ROUTE NOT FOUND</p><h1>WRONG<br /><span>DIRECTION.</span></h1><a className="primary-button" href="/">BACK TO HOME</a></main>} />
      </Routes>
      <Toaster position="bottom-right" toastOptions={{ style: { border: '1px solid #111', borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: '11px', boxShadow: '3px 3px 0 #111' } }} />
    </>
  );
}
