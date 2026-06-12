import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling';
import ProfileMenu from '../components/ProfileMenu';

// Pipeline step definitions mapped to backend statuses
const PIPELINE_STEPS = [
  { key: 'fetching', label: 'Fetching comments', icon: 'download', description: 'Scraping YouTube comments & video metadata' },
  { key: 'analyzing', label: 'Running NLP model', icon: 'psychology', description: 'Classifying sentiments with ML model & VADER' },
  { key: 'embedding', label: 'Generating insights', icon: 'insights', description: 'Embedding comments into ChromaDB for RAG' },
];

const STATUS_ORDER = ['queued', 'fetching', 'analyzing', 'embedding', 'completed', 'failed'];

function getStepState(stepKey, currentStatus) {
  const stepIdx = STATUS_ORDER.indexOf(stepKey);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  if (currentStatus === 'failed') {
    // Steps before the failure point are complete; the step at failure point is error
    if (stepIdx < currentIdx) return 'completed';
    return 'pending';
  }
  if (currentStatus === 'completed') return 'completed';
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

function Analyze() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('id');
  const navigate = useNavigate();

  // ── Submit mode state ──
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [maxComments, setMaxComments] = useState(100);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async ({ url, maxComments }) => {
      const { data } = await api.post('/analyses', { youtube_url: url, max_comments: maxComments });
      return data;
    },
    onSuccess: (data) => {
      navigate(`/analyze?id=${data.analysis_id}`, { replace: true });
    },
    onError: (err) => {
      setUrlError(err.response?.data?.error || 'Failed to start analysis.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setUrlError('');
    if (!youtubeUrl.trim()) {
      setUrlError('Please enter a YouTube URL.');
      return;
    }
    submitMutation.mutate({ url: youtubeUrl.trim(), maxComments });
  };

  // ── Polling mode ──
  const { status, progress, errorMessage } = useAnalysisPolling(analysisId);

  // Fetch analysis details for video info (only when we have an ID)
  const { data: analysisData } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const { data } = await api.get(`/analyses/${analysisId}`);
      return data.analysis;
    },
    enabled: !!analysisId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === 'completed' || s === 'failed') return false;
      return 5000;
    },
  });

  // Auto-navigate on completion
  useEffect(() => {
    if (status === 'completed' && analysisId) {
      const timer = setTimeout(() => {
        navigate(`/analysis/${analysisId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, analysisId, navigate]);

  // ── Submit mode UI ──
  if (!analysisId) {
    return (
      <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col overflow-x-hidden overflow-y-auto">
        <header className="fixed top-0 w-full z-50">
          <nav className="w-full bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-2xl shadow-black/40 font-inter tracking-tight">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <Link to="/dashboard" className="text-xl font-bold tracking-tighter text-slate-100 uppercase">CineSentia</Link>
            </div>
            <div className="flex items-center space-x-4">
              <ProfileMenu />
            </div>
          </nav>
        </header>

        {/* SideNavBar */}
        <aside className={`fixed left-0 top-0 h-full w-64 z-40 bg-slate-900 text-sm flex flex-col py-20 border-r border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden lg:flex`}>
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
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 transition-all font-label" to="/analyze">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              <span>New Analysis</span>
            </Link>
            <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/history">
              <span className="material-symbols-outlined">history</span>
              <span>Riwayat</span>
            </Link>
            <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/profile">
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </Link>
          </nav>
        </aside>

        <main className={`flex-grow pt-32 pb-20 px-8 max-w-4xl w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-64 mx-auto lg:mx-0' : 'mx-auto'}`}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary pulse-glow"></div>
              <span className="text-primary font-medium tracking-widest text-xs uppercase">Ready</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter mb-6">
              Start a New <br /><span className="text-primary-container">Analysis.</span>
            </h1>
          </div>

          <div className="glass-panel p-8 md:p-12 rounded-xl relative shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 text-on-surface flex items-center font-headline">
                <span className="material-symbols-outlined mr-2 text-primary">link</span>
                YouTube URL
              </h2>
              <p className="text-on-surface-variant mb-6">Paste a YouTube video URL and we'll analyze its comment sentiment.</p>
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-stretch">
                <div className="relative flex-grow">
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg placeholder:text-outline/50 font-body"
                    placeholder="https://www.youtube.com/watch?v=..."
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => { setYoutubeUrl(e.target.value); setUrlError(''); }}
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full h-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface rounded-xl py-4 px-6 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg font-body flex items-center justify-between gap-2"
                  >
                    <span>{maxComments} Komentar</span>
                    <span className={`material-symbols-outlined transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                      <ul className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 max-h-60 overflow-y-auto animate-fade-in divide-y divide-white/5">
                        {[10, 100, 1000, 5000, 10000].map((val) => (
                          <li key={val}>
                            <button
                              type="button"
                              onClick={() => {
                                setMaxComments(val);
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-6 py-3 text-sm transition-all hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center justify-between ${maxComments === val ? 'text-indigo-400 font-bold bg-indigo-500/5' : 'text-on-surface-variant'}`}
                            >
                              <span>{val} Komentar</span>
                              {maxComments === val && (
                                <span className="material-symbols-outlined text-sm text-indigo-400">check</span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                <button
                  className={`primary-gradient text-on-primary-container font-bold px-10 py-4 rounded-xl shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-2 ${submitMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">rocket_launch</span>
                      Analisis
                    </>
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
        </main>
      </div>
    );
  }

  // ── Polling mode UI ──
  const statusLabel = status === 'completed' ? 'Analysis Complete!' :
                      status === 'failed' ? 'Analysis Failed' :
                      'Analyzing...';

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col overflow-x-hidden overflow-y-auto">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50">
        <nav className="w-full bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-2xl shadow-black/40 font-inter tracking-tight">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/dashboard" className="text-xl font-bold tracking-tighter text-slate-100 uppercase">CineSentia</Link>
          </div>
          <div className="flex items-center space-x-4">
            <ProfileMenu />
          </div>
        </nav>
      </header>

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-40 bg-slate-900 text-sm flex flex-col py-20 border-r border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden lg:flex`}>
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
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 transition-all font-label" to="/analyze">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            <span>New Analysis</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/history">
            <span className="material-symbols-outlined">history</span>
            <span>Riwayat</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/profile">
            <span className="material-symbols-outlined">person</span>
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      <main className={`flex-grow pt-32 pb-20 px-8 max-w-7xl w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-64 mx-auto lg:mx-0' : 'mx-auto'}`}>
        {/* Analyzing State Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-2 h-2 rounded-full ${status === 'failed' ? 'bg-error' : status === 'completed' ? 'bg-green-500' : 'bg-primary'} pulse-glow`}></div>
            <span className={`font-medium tracking-widest text-xs uppercase ${status === 'failed' ? 'text-error' : status === 'completed' ? 'text-green-500' : 'text-primary'}`}>
              {status === 'completed' ? 'Completed' : status === 'failed' ? 'Error' : 'System Live'}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter mb-6">
            {status === 'completed' ? (
              <>Analysis <br /><span className="text-green-400">Complete! ✓</span></>
            ) : status === 'failed' ? (
              <>Pipeline <br /><span className="text-error">Failed.</span></>
            ) : (
              <>Descending into <br /><span className="text-primary-container">Sentiment Depths.</span></>
            )}
          </h1>
        </div>

        {/* Asymmetric Layout: Analysis Core */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Processing Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* URL Display Container */}
            <div className="bg-surface-container-low rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <label className="block text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-3">Source URL</label>
              <div className="flex items-center gap-4 bg-surface-container rounded-lg px-4 py-4 border border-outline-variant/15">
                <span className="material-symbols-outlined text-primary">link</span>
                <input className="bg-transparent border-none text-on-surface w-full focus:ring-0 font-medium overflow-ellipsis" readOnly type="text" value={analysisData?.youtube_url || '...'} />
              </div>
            </div>

            {/* Analyzing Progress Section */}
            <div className="bg-surface-container rounded-xl p-8 relative">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">{statusLabel}</h2>
                  <p className="text-on-surface-variant max-w-md">
                    {status === 'failed' ? (errorMessage || 'An unexpected error occurred.') :
                     status === 'completed' ? 'All pipeline stages finished successfully. Redirecting...' :
                     'Our Abyssal Curator is parsing metadata, comment threads, and temporal spikes to map the audience psyche.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black font-headline ${status === 'failed' ? 'text-error' : status === 'completed' ? 'text-green-400' : 'text-primary'}`}>
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden mb-12">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${status === 'failed' ? 'bg-error' : status === 'completed' ? 'bg-green-500' : 'abyssal-gradient'} shadow-[0_0_20px_rgba(128,131,255,0.4)]`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Pipeline Steps */}
              <div className="space-y-6">
                {PIPELINE_STEPS.map((step) => {
                  const state = getStepState(step.key, status);
                  return (
                    <div key={step.key} className={`flex items-center gap-6 group ${state === 'pending' ? 'opacity-40' : ''}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        state === 'completed' ? 'bg-secondary-container/30' :
                        state === 'active' ? 'bg-primary/10 animate-pulse' :
                        'bg-surface-container-highest'
                      }`}>
                        {state === 'completed' ? (
                          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        ) : state === 'active' ? (
                          <span className="material-symbols-outlined text-primary text-xl">{step.icon}</span>
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant text-xl">{step.icon}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <h4 className={`font-bold ${state === 'active' ? 'text-primary' : 'text-on-surface'}`}>{step.label}</h4>
                          <span className={`text-xs font-mono ${
                            state === 'completed' ? 'text-on-surface-variant/60' :
                            state === 'active' ? 'text-primary italic' :
                            'text-on-surface-variant'
                          }`}>
                            {state === 'completed' ? 'Completed' : state === 'active' ? 'In Progress' : 'Queued'}
                          </span>
                        </div>
                        <div className={`h-[1px] w-full mt-2 ${state === 'active' ? 'bg-primary/20' : 'bg-outline-variant/10'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error message for failed state */}
              {status === 'failed' && errorMessage && (
                <div className="mt-8 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-bold">Pipeline Error</span>
                  </div>
                  <p>{errorMessage}</p>
                  <Link to="/dashboard" className="inline-block mt-4 text-primary font-semibold hover:underline">
                    ← Back to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Side Skeleton/Data Preview Column */}
          <div className="space-y-8">
            {/* Video Card */}
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-xl border border-outline-variant/5">
              <div className="aspect-video bg-surface-container-highest relative overflow-hidden group">
                {analysisData?.thumbnail_url ? (
                  <img className="w-full h-full object-cover" alt={analysisData.video_title} src={analysisData.thumbnail_url} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 animate-pulse">movie</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
              </div>
              <div className="p-6 space-y-4">
                {analysisData?.video_title ? (
                  <>
                    <h3 className="font-bold text-on-surface line-clamp-2">{analysisData.video_title}</h3>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">person</span>
                      {analysisData.channel_name || 'Unknown'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-6 w-3/4 bg-surface-container-highest rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-surface-container-highest/50 rounded animate-pulse"></div>
                  </>
                )}
              </div>
            </div>

            {/* Deep Ocean Loading Animation */}
            <div className="bg-surface-container rounded-xl p-8 aspect-square flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path className="animate-pulse" d="M0 50 Q 25 45 50 50 T 100 50" fill="none" stroke="#c0c1ff" strokeWidth="0.5"></path>
                </svg>
              </div>
              <div className="relative z-10 text-center">
                {status === 'completed' ? (
                  <>
                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 mx-auto">
                      <span className="material-symbols-outlined text-green-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h3 className="text-on-surface font-bold text-lg mb-2">Analysis Complete</h3>
                    <p className="text-on-surface-variant text-sm">Redirecting to results...</p>
                  </>
                ) : status === 'failed' ? (
                  <>
                    <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mb-6 mx-auto">
                      <span className="material-symbols-outlined text-error text-5xl">error</span>
                    </div>
                    <h3 className="text-on-surface font-bold text-lg mb-2">Pipeline Failed</h3>
                    <p className="text-on-surface-variant text-sm">Check the error details on the left.</p>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-6 mx-auto"></div>
                    <h3 className="text-on-surface font-bold text-lg mb-2">Abyssal Scan</h3>
                    <p className="text-on-surface-variant text-sm">
                      {analysisData?.total_comments
                        ? `Processing ${analysisData.total_comments.toLocaleString()} comments...`
                        : 'Quantifying emotional resonance across comment nodes.'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metric Pulse Row (Subtle) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary blur-[2px]"></div>
              <span className="text-xs text-on-surface-variant uppercase tracking-tighter">Status</span>
            </div>
            <div className="text-2xl font-bold text-on-surface capitalize">{status}</div>
          </div>
          <div className="p-6 bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary blur-[2px]"></div>
              <span className="text-xs text-on-surface-variant uppercase tracking-tighter">Progress</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{progress}%</div>
          </div>
          <div className="p-6 bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary blur-[2px]"></div>
              <span className="text-xs text-on-surface-variant uppercase tracking-tighter">Video</span>
            </div>
            <div className="text-lg font-bold text-on-surface truncate">{analysisData?.channel_name || '—'}</div>
          </div>
          <div className="p-6 bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary blur-[2px]"></div>
              <span className="text-xs text-on-surface-variant uppercase tracking-tighter">Comments</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{analysisData?.total_comments?.toLocaleString() || '—'}</div>
          </div>
        </div>

      </main>

      {/* Universal CineSentia Footer */}
      <footer className={`border-t border-white/5 bg-[#070d19] py-12 px-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold tracking-tight text-[#dae2fd] uppercase font-headline">CineSentia</span>
            <p className="text-xs text-slate-500 font-label">© 2024 CineSentia. Deep Ocean Cinematic Sentiment Analytics.</p>
          </div>
          <div className="flex gap-8 text-xs font-label">
            <Link className="text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider" to="/">Privacy Policy</Link>
            <Link className="text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider" to="/">Terms of Service</Link>
            <Link className="text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider" to="/">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Analyze;
