import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

function SharedReport() {
  const { token } = useParams();

  const { data: reportData, isLoading, isError } = useQuery({
    queryKey: ['shared-report', token],
    queryFn: async () => {
      const { data } = await api.get(`/reports/${token}`);
      return data.analysis;
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center overflow-x-hidden overflow-y-auto">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !reportData) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-center overflow-x-hidden overflow-y-auto">
        <div>
          <span className="material-symbols-outlined text-6xl text-error mb-4 block">error</span>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Report Not Found</h1>
          <p className="text-on-surface-variant mb-6">This shared report link may have expired or been deactivated.</p>
          <Link to="/" className="text-primary font-semibold hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const a = reportData;
  const posPct = a.positive_pct || 0;
  const negPct = a.negative_pct || 0;
  const neuPct = a.neutral_pct || 0;

  // SVG donut calculations (circumference = 2*π*40 ≈ 251)
  const circ = 251;
  const posDash = (posPct / 100) * circ;
  const negDash = (negPct / 100) * circ;
  const neuDash = (neuPct / 100) * circ;

  const formatNum = (n) => n ? n.toLocaleString() : '0';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen overflow-x-hidden overflow-y-auto">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center px-8 h-16 w-full max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tighter text-[#dae2fd]">CineSentia</div>
          <div className="flex items-center gap-4">
            <Link to="/register" className="bg-[#6366F1] text-white px-5 py-2 rounded-lg font-semibold hover:scale-95 duration-200 transition-all">
              Try CineSentia
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="hero-gradient relative pt-24 pb-16 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/15 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c0c1ff]"></span>
              <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">Public Sentiment Report</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 max-w-4xl mx-auto leading-tight">
              {a.video_title || 'Sentiment Analysis Report'}
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-on-surface-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-on-surface-variant">person</span>
                </div>
                <span className="font-medium text-on-surface">{a.channel_name || 'Unknown'}</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-outline-variant/30"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                <span>Report Generated {formatDate(a.completed_at || a.created_at)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section: Bento Layout */}
        <section className="px-8 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sentiment Overview */}
            <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
              <div>
                <h3 className="text-2xl font-bold text-on-surface mb-2">Sentiment Distribution</h3>
                <p className="text-on-surface-variant mb-8">Audience perception breakdown across {formatNum(a.total_comments)} interactions.</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-64 h-64">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="12" />
                    <circle className="text-primary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray={`${posDash} ${circ}`} strokeLinecap="round" strokeWidth="12" />
                    <circle className="text-error" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray={`${negDash} ${circ}`} strokeDashoffset={`-${posDash}`} strokeLinecap="round" strokeWidth="12" />
                    <circle className="text-secondary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray={`${neuDash} ${circ}`} strokeDashoffset={`-${posDash + negDash}`} strokeLinecap="round" strokeWidth="12" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-on-surface">{Math.round(posPct)}%</span>
                    <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Positive</span>
                  </div>
                </div>
                <div className="flex flex-col gap-6 w-full md:w-auto">
                  <div className="flex items-center justify-between gap-12">
                    <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-primary"></span><span className="font-medium text-on-surface-variant">Positive</span></div>
                    <span className="font-bold text-on-surface">{posPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-12">
                    <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-error"></span><span className="font-medium text-on-surface-variant">Negative</span></div>
                    <span className="font-bold text-on-surface">{negPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-12">
                    <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-secondary"></span><span className="font-medium text-on-surface-variant">Neutral</span></div>
                    <span className="font-bold text-on-surface">{neuPct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            </div>

            {/* Stats Column */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              <div className="bg-surface-container rounded-xl p-8 flex flex-col justify-center">
                <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mb-4">Volume</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-on-surface">{formatNum(a.total_comments)}</span>
                  <span className="material-symbols-outlined text-primary text-xl">forum</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-2">Total Comments Analyzed</p>
              </div>
              <div className="bg-surface-container-high rounded-xl p-8 flex flex-col justify-center border border-primary/10">
                <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mb-4">Precision Index</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">{a.model_accuracy ? `${a.model_accuracy.toFixed(1)}%` : '—'}</span>
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-2">Model Accuracy Score</p>
              </div>
              <div className="bg-surface-container rounded-xl p-8 flex flex-col justify-center">
                <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mb-4">Core Theme</span>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-bold text-lg">{a.top_keyword || '—'}</span>
                  <span className="material-symbols-outlined text-secondary text-xl">auto_awesome</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-2">Most Frequent Keyword</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-8 py-24 bg-surface-container-low relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-6">Want to analyze your own video?</h2>
            <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto">Get the same depth of insights for your projects. Join creators using CineSentia.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="cta-gradient text-on-tertiary-container px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-[0_10px_30px_-10px_#8083ff]">Register for free</Link>
              <Link to="/" className="px-10 py-4 rounded-xl font-bold text-lg border border-outline-variant/30 text-on-surface hover:bg-white/5 transition-all">Back to Home</Link>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        </section>
      </main>

      <footer className="bg-[#131b2e] w-full py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-6 w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-[#dae2fd]">CineSentia</span>
            <span className="text-sm text-[#c7c4d7]">© 2024 CineSentia. Deep Ocean Analytics.</span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link className="text-[#c7c4d7] hover:text-[#dae2fd] transition-all" to="/">Privacy Policy</Link>
            <Link className="text-[#c7c4d7] hover:text-[#dae2fd] transition-colors" to="/">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SharedReport;
