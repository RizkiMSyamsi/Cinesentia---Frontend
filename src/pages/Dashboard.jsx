import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from '../components/ProfileMenu';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Fetch quota
  const { data: quotaData } = useQuery({
    queryKey: ['quota'],
    queryFn: async () => {
      const { data } = await api.get('/quota');
      return data;
    },
  });

  // Fetch recent analyses
  const { data: analysesData, isLoading: analysesLoading } = useQuery({
    queryKey: ['analyses', { limit: 6 }],
    queryFn: async () => {
      const { data } = await api.get('/analyses?limit=6');
      return data;
    },
  });

  // Submit new analysis
  const submitMutation = useMutation({
    mutationFn: async (url) => {
      const { data } = await api.post('/analyses', { youtube_url: url });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['analyses'] });
      qc.invalidateQueries({ queryKey: ['quota'] });
      navigate(`/analyze?id=${data.analysis_id}`);
    },
    onError: (err) => {
      setUrlError(err.response?.data?.error || 'Failed to start analysis.');
    },
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    setUrlError('');
    if (!youtubeUrl.trim()) {
      setUrlError('Please enter a YouTube URL.');
      return;
    }
    submitMutation.mutate(youtubeUrl.trim());
  };

  const quotaUsed = quotaData?.daily_quota_used ?? 0;
  const quotaLimit = quotaData?.daily_quota_limit ?? 3;
  const quotaRemaining = quotaData?.quota_remaining ?? (quotaLimit - quotaUsed);
  const quotaPct = quotaLimit > 0 ? ((quotaUsed / quotaLimit) * 100) : 0;

  const analyses = analysesData?.analyses ?? [];

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format number helper
  const formatNumber = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toString();
  };

  // Determine dominant sentiment for badge
  const getDominantSentiment = (a) => {
    const max = Math.max(a.positive_pct || 0, a.negative_pct || 0, a.neutral_pct || 0);
    if (max === a.positive_pct) return { label: `${Math.round(a.positive_pct)}% Positif`, color: 'green' };
    if (max === a.negative_pct) return { label: `${Math.round(a.negative_pct)}% Negatif`, color: 'red' };
    return { label: `${Math.round(a.neutral_pct)}% Netral`, color: 'primary' };
  };

  const firstName = user?.full_name?.split(' ')[0] || 'User';

  return (
    <div className="overflow-x-hidden font-body text-on-surface bg-background">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 max-w-full mx-auto shadow-2xl shadow-black/40">
        <div className="text-xl font-bold tracking-tighter text-slate-100 font-headline">CineSentia</div>
        <div className="hidden md:flex space-x-8 tracking-tight font-headline">
          <Link className="text-indigo-300 font-semibold border-b-2 border-indigo-500 pb-1" to="/dashboard">Dashboard</Link>
          <a className="text-slate-400 hover:text-slate-200 transition-colors" href="#">Features</a>
          <a className="text-slate-400 hover:text-slate-200 transition-colors" href="#">About</a>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <input className="bg-surface-container-low border border-outline-variant/15 rounded-lg py-1.5 px-4 text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Search insights..." type="text" />
          </div>
          <ProfileMenu />
        </div>
      </nav>

      {/* SideNavBar (AI Explorer Focused) */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-slate-900 text-sm flex flex-col py-20 transition-transform duration-200 ease-in-out hidden lg:flex border-r border-white/5">
        <div className="px-6 mb-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary">psychology</span>
            </div>
            <div>
              <h2 className="text-slate-100 font-black text-base font-headline">AI Explorer</h2>
              <p className="text-slate-500 text-xs font-label">Deep Dive Analysis</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/dashboard">
            <span className="material-symbols-outlined">analytics</span>
            <span>Sentiments</span>
          </Link>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" href="#">
            <span className="material-symbols-outlined">groups</span>
            <span>Demographics</span>
          </a>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 transition-all font-label" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span>AI Explorer</span>
          </a>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" href="#">
            <span className="material-symbols-outlined">history</span>
            <span>History</span>
          </a>
        </nav>

        <div className="px-6 mt-auto pb-8">
          <Link to="/analyze" className="block w-full py-3 primary-gradient text-on-primary-container font-semibold rounded-lg shadow-lg shadow-primary/20 scale-95 active:scale-90 transition-all text-center">
            New Analysis
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="lg:ml-64 pt-28 pb-20 md:pb-12 px-6 md:px-12 min-h-screen bg-surface">
        {/* Header Greeting & Quota */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Selamat datang, {firstName}! 👋</h1>
            <p className="text-on-surface-variant text-lg">Siap untuk menyelami sentimen audiens hari ini?</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl min-w-[280px] border border-outline-variant/10 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-on-surface-variant uppercase tracking-widest font-label">Quota Analysis</span>
              <span className="text-sm font-bold text-primary font-headline">{quotaRemaining}/{quotaLimit} tersisa</span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div className="primary-gradient h-full rounded-full transition-all duration-500" style={{ width: `${quotaPct}%` }}></div>
            </div>
            <p className="text-[10px] text-outline mt-3 uppercase tracking-tighter font-label">Upgrade ke Pro untuk kuota tak terbatas</p>
          </div>
        </header>

        {/* Analyze Section */}
        <section className="mb-16">
          <div className="glass-panel p-8 md:p-12 rounded-xl relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-2xl font-bold mb-6 text-on-surface flex items-center font-headline">
                <span className="material-symbols-outlined mr-2 text-primary">search</span>
                Mulai Analisis Baru
              </h2>
              <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg placeholder:text-outline/50 font-body"
                    placeholder="Masukkan URL YouTube..."
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => { setYoutubeUrl(e.target.value); setUrlError(''); }}
                  />
                </div>
                <button
                  className={`primary-gradient text-on-primary-container font-bold px-10 py-4 rounded-xl shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center ${submitMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Analisis'
                  )}
                </button>
              </form>
              {urlError && (
                <p className="text-error text-sm mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {urlError}
                </p>
              )}
              <p className="text-on-surface-variant text-sm mt-4 italic">Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
            </div>
          </div>
        </section>

        {/* History Grid (Bento Style) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-tight text-on-surface font-headline">Riwayat Analisis</h3>
            <button className="text-primary text-sm font-medium hover:underline font-label">Lihat Semua</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {analysesLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5 shadow-lg">
                  <div className="relative h-48 bg-surface-container-high animate-pulse overflow-hidden flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/40 text-5xl animate-spin">sync</span>
                  </div>
                  <div className="p-6">
                    <div className="h-6 w-3/4 bg-surface-container-high rounded-full mb-3 animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-surface-container-high rounded-full mb-6 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : analyses.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">science</span>
                <h4 className="text-lg font-bold text-on-surface mb-2">Belum ada analisis</h4>
                <p className="text-on-surface-variant text-sm">Mulai analisis pertama Anda dengan memasukkan URL YouTube di atas.</p>
              </div>
            ) : (
              analyses.map((analysis) => {
                const isProcessing = analysis.status !== 'completed' && analysis.status !== 'failed';

                if (isProcessing) {
                  return (
                    <Link to={`/analyze?id=${analysis.id}`} key={analysis.id} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5 shadow-lg group">
                      <div className="relative h-48 bg-surface-container-high animate-pulse overflow-hidden flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary/40 text-5xl animate-spin">sync</span>
                        <div className="absolute bottom-4 left-4 bg-surface-dim/80 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest font-label">
                          {analysis.status === 'failed' ? 'Failed' : 'Processing'}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-on-surface font-bold text-lg mb-1 line-clamp-1 font-headline">{analysis.video_title || 'Analyzing...'}</h4>
                        <p className="text-on-surface-variant text-sm mb-3">{analysis.progress}% complete</p>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div className="primary-gradient h-full rounded-full transition-all duration-300" style={{ width: `${analysis.progress}%` }}></div>
                        </div>
                      </div>
                    </Link>
                  );
                }

                const sentiment = getDominantSentiment(analysis);
                const sentimentColors = {
                  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.8)]' },
                  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500', glow: '' },
                  primary: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30', dot: 'bg-primary', glow: 'shadow-[0_0_8px_#c0c1ff]' },
                };
                const sc = sentimentColors[sentiment.color];

                return (
                  <Link to={`/analysis/${analysis.id}`} key={analysis.id} className="bg-surface-container rounded-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 border border-outline-variant/5 shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      {analysis.thumbnail_url ? (
                        <img alt={analysis.video_title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={analysis.thumbnail_url} />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">movie</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/90 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                        <div className={`${sc.bg} ${sc.text} backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold ${sc.border} border flex items-center font-label`}>
                          <span className={`w-2 h-2 rounded-full ${sc.dot} mr-2 ${sc.glow}`}></span>
                          {sentiment.label}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-on-surface font-bold text-lg mb-1 line-clamp-1 font-headline">{analysis.video_title || 'Untitled'}</h4>
                      <p className="text-on-surface-variant text-sm mb-6">{formatDate(analysis.created_at)} • {formatNumber(analysis.total_comments)} Komentar</p>
                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">person</span>
                          {analysis.channel_name || 'Unknown'}
                        </div>
                        <span className="text-sm font-bold text-primary flex items-center group-hover:translate-x-1 transition-transform font-label">
                          Lihat Detail
                          <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="lg:ml-64 bg-slate-950 w-auto py-8 border-t border-white/5 flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-8">
          <a className="text-slate-600 hover:text-slate-100 text-xs font-label uppercase tracking-widest transition-all" href="#">Privacy Policy</a>
          <a className="text-slate-600 hover:text-slate-100 text-xs font-label uppercase tracking-widest transition-all" href="#">Terms of Service</a>
          <a className="text-slate-600 hover:text-slate-100 text-xs font-label uppercase tracking-widest transition-all" href="#">Support</a>
        </div>
        <p className="text-slate-500 text-xs font-label uppercase tracking-widest opacity-80">© 2024 CineSentia. Deep Ocean Analytics.</p>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-4 px-6 z-50">
        <Link className="flex flex-col items-center space-y-1 text-indigo-400 group" to="/dashboard">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-bold font-label">Dashboard</span>
        </Link>
        <a className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300 transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">analytics</span>
          <span className="text-[10px] font-label">Sentiments</span>
        </a>
        <a className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300 transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">psychology</span>
          <span className="text-[10px] font-label">AI Explorer</span>
        </a>
        <Link className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300 transition-colors group" to="/profile">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">person</span>
          <span className="text-[10px] font-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default Dashboard;
