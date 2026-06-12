import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthPage({ initiallyLogin = true }) {
  const [isLogin, setIsLogin] = useState(initiallyLogin);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(fullName, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (isLogin ? 'Invalid email or password.' : 'Registration failed. Please try again.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset error when switching tabs
  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError('');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#0b1326] text-on-surface">
      {/* Background gradients and elements */}
      <div className="fixed inset-0 gradient-bg z-0 pointer-events-none"></div>
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] z-0 pointer-events-none"></div>
      <div className="fixed -bottom-24 -right-24 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[140px] z-0 pointer-events-none"></div>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 max-w-full mx-auto shadow-2xl shadow-black/40">
        <Link to="/" className="text-xl font-bold tracking-tighter text-slate-100 font-headline uppercase">
          CineSentia
        </Link>

      </header>

      <main className="relative z-10 w-full max-w-[480px] mx-auto flex-grow flex flex-col items-center justify-center pt-28 pb-16 px-6">
        <div className="w-full glass-panel rounded-2xl p-8 md:p-10 shadow-2xl border border-white/5 relative">

          <header className="flex flex-col items-center mb-8 text-center">
            {isLogin ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">🎬</span>
                  <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase font-headline">CineSentia</h1>
                </div>
                <p className="text-on-surface-variant text-sm font-label tracking-wide">Deep Ocean Movie Analytics</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">Mulai Eksplorasi</h1>
                <p className="text-on-surface-variant font-body text-sm">Bergabunglah dengan Abyssal Curator untuk sentiment analysis trailer film mendalam.</p>
              </>
            )}
          </header>

          {/* Toggle Navigation Tab */}
          <nav className="flex w-full mb-8 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => switchTab(true)}
              className={`flex-grow text-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${isLogin ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 border border-transparent hover:text-slate-200'}`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab(false)}
              className={`flex-grow text-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${!isLogin ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 border border-transparent hover:text-slate-200'}`}
            >
              Register
            </button>
          </nav>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Full Name Field (Only for Register) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">username</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">person</span>
                  <input
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-body"
                    placeholder="username"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="email">
                Alamat Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">email</span>
                <input
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-body"
                  id="email"
                  placeholder="nama@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                <input
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-on-surface placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-body"
                  id="password"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me (Only Login) */}
            {isLogin && (
              <div className="flex items-center space-x-3 px-1">
                <input
                  className="w-4 h-4 rounded border-outline-variant/30 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-surface-dim"
                  id="remember"
                  type="checkbox"
                />
                <label className="text-sm text-on-surface-variant font-label" htmlFor="remember">Ingat saya untuk 30 hari</label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                className={`w-full py-4 rounded-xl text-white font-bold tracking-wide shadow-lg transition-all duration-200 flex items-center justify-center gap-2 primary-gradient hover:scale-[1.02] active:scale-[0.98] shadow-indigo-500/10 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Memproses...' : 'Mendaftar...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Masuk' : 'Daftar'}</span>
                    {!isLogin && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Extra Utilities */}
          {isLogin && (
            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant font-label">
                Belum punya akun? <button className="text-indigo-400 font-bold hover:underline ml-1" onClick={() => switchTab(false)}>Daftar di sini</button>
              </p>
            </div>
          )}

          {/* Register Extra Utilities */}
          {!isLogin && (
            <>
              <div className="mt-8 text-center">
                <p className="text-on-surface-variant text-sm font-body">
                  Sudah memiliki akun?
                  <button className="text-indigo-400 font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1" onClick={() => switchTab(true)}>Masuk di sini</button>
                </p>
              </div>


            </>
          )}
        </div>

        {/* Register Support Marks */}
        {!isLogin && (
          <div className="w-full max-w-md mt-6 flex justify-between items-center opacity-40 px-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] uppercase tracking-tighter">Koneksi Terenkripsi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">database</span>
              <span className="text-[10px] uppercase tracking-tighter">Keamanan Data Abyssal</span>
            </div>
          </div>
        )}

      </main>



      {/* Clean Footer */}
      <footer className="w-full py-8 bg-slate-950/40 border-t border-white/5 text-center relative z-20">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">
          © 2024 CineSentia. Protected by Abyssal Security.
        </p>
      </footer>
    </div>
  );
}

export default AuthPage;
