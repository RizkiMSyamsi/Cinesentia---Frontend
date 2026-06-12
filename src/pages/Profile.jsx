import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from '../components/ProfileMenu';

function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saveMsg, setSaveMsg] = useState('');

  // Password modal
  const [showPwModal, setShowPwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Quota
  const { data: quotaData } = useQuery({
    queryKey: ['quota'],
    queryFn: async () => { const { data } = await api.get('/quota'); return data; },
  });

  // Recent analyses
  const { data: recentData } = useQuery({
    queryKey: ['analyses', { limit: 3 }],
    queryFn: async () => { const { data } = await api.get('/analyses?limit=3'); return data; },
  });

  // Save profile
  const profileMutation = useMutation({
    mutationFn: async (payload) => { const { data } = await api.put('/users/profile', payload); return data; },
    onSuccess: () => { refreshUser(); setSaveMsg('Profile updated!'); setTimeout(() => setSaveMsg(''), 3000); },
    onError: (err) => { setSaveMsg(err.response?.data?.error || 'Failed to save.'); },
  });

  // Change password
  const pwMutation = useMutation({
    mutationFn: async (payload) => { const { data } = await api.put('/users/password', payload); return data; },
    onSuccess: () => { setPwSuccess('Password changed!'); setCurrentPw(''); setNewPw(''); setTimeout(() => { setShowPwModal(false); setPwSuccess(''); }, 2000); },
    onError: (err) => { setPwError(err.response?.data?.error || 'Failed to change password.'); },
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaveMsg('');
    profileMutation.mutate({ full_name: fullName, email });
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    pwMutation.mutate({ current_password: currentPw, new_password: newPw });
  };

  const quotaUsed = quotaData?.daily_quota_used ?? 0;
  const quotaLimit = quotaData?.daily_quota_limit ?? 3;
  const quotaPct = quotaLimit > 0 ? ((quotaUsed / quotaLimit) * 100) : 0;
  const analyses = recentData?.analyses ?? [];
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const formatDate = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden overflow-y-auto">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-2xl shadow-black/40 tracking-tight">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/dashboard" className="text-xl font-bold tracking-tighter text-slate-100 uppercase">CineSentia</Link>
        </div>
        <div className="flex items-center space-x-4">
          <ProfileMenu />
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-40 bg-slate-900 text-sm flex flex-col py-20 border-r border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden md:flex`}>
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
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/analyze">
            <span className="material-symbols-outlined">add_circle</span>
            <span>New Analysis</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/history">
            <span className="material-symbols-outlined">history</span>
            <span>Riwayat</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 transition-all font-label" to="/profile">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      <main className={`pt-32 pb-20 px-8 max-w-7xl w-full transition-all duration-300 ${sidebarOpen ? 'md:ml-64 mx-auto md:mx-0' : 'mx-auto'}`}>
        <div className="flex flex-col gap-12">
          {/* Profile Header */}
          <section className="relative w-full overflow-hidden rounded-xl bg-surface-container-low p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-outline-variant/5">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="relative w-32 h-32 rounded-full border-4 border-primary-container p-1 shrink-0">
              {user?.avatar_url ? (
                <img alt="Profile" className="w-full h-full object-cover rounded-full" src={user.avatar_url} />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">{initials}</div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">{user?.full_name || 'User'}</h1>
              <p className="text-on-surface-variant text-lg mt-1 font-medium">Curator of Sentiment • {user?.plan_tier || 'Free'} Member</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-widest">Active</span>
                <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded-full uppercase tracking-widest">
                  Since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Account Settings */}
              <section className="bg-surface-container p-8 rounded-xl border border-outline-variant/5">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h2 className="text-xl font-bold text-on-surface">Account Settings</h2>
                </div>
                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                      <input className="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                      <input className="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input className="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface" type="password" value="••••••••••••" readOnly />
                        <button type="button" onClick={() => { setShowPwModal(true); setPwError(''); setPwSuccess(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-sm font-semibold hover:underline">Change</button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-4">
                    {saveMsg && <span className={`text-sm ${profileMutation.isError ? 'text-error' : 'text-green-400'}`}>{saveMsg}</span>}
                    <button type="submit" disabled={profileMutation.isPending} className={`abyssal-gradient text-on-primary font-bold px-8 py-3 rounded-lg active:scale-95 duration-200 transition-all ${profileMutation.isPending ? 'opacity-70' : ''}`}>
                      {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <div className="space-y-8">
              {/* Plan & Usage */}
              <section className="bg-surface-container p-8 rounded-xl border border-outline-variant/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  <h2 className="text-xl font-bold text-on-surface">Plan &amp; Usage</h2>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-lg mb-6 border border-primary/10">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Current Tier</p>
                  <h3 className="text-2xl font-black text-primary capitalize">{user?.plan_tier || 'Free'}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-on-surface-variant uppercase tracking-tighter">Daily Quota</span>
                      <span className="text-green-400 font-bold">Unlimited (No Limit)</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="bg-surface-container p-8 rounded-xl border border-outline-variant/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">history</span>
                  <h2 className="text-xl font-bold text-on-surface">Recent Activity</h2>
                </div>
                <div className="space-y-4">
                  {analyses.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No recent activity.</p>
                  ) : (
                    analyses.map((a) => (
                      <Link key={a.id} to={`/analysis/${a.id}`} className="flex gap-4 items-start hover:bg-white/5 p-2 rounded-lg transition-all">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_#c0c1ff]"></div>
                        <div>
                          <p className="text-sm text-on-surface">{a.video_title || 'Analysis'}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">{formatDate(a.created_at)}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPwModal(false)}>
          <div className="bg-surface-container-high rounded-xl p-8 w-full max-w-md border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Change Password</h3>
              <button onClick={() => setShowPwModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {pwError && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">{pwError}</div>}
            {pwSuccess && <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{pwSuccess}</div>}
            <form onSubmit={handlePwSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current Password</label>
                <input className="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">New Password</label>
                <input className="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
              </div>
              <button type="submit" disabled={pwMutation.isPending} className={`w-full abyssal-gradient text-on-primary font-bold py-3 rounded-lg mt-4 ${pwMutation.isPending ? 'opacity-70' : ''}`}>
                {pwMutation.isPending ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Universal CineSentia Footer */}
      <footer className={`border-t border-white/5 bg-[#070d19] py-12 px-8 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
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

export default Profile;
