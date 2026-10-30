import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ShieldCheck, AlertCircle, ArrowRight, Server, Key } from 'lucide-react';
import { getActiveApiUrl, setActiveApiUrl } from '../../api/client';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiUrl, setApiUrl] = useState(getActiveApiUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = () => {
    setEmail('admin@winterarc.pro');
    setPassword('Admin@WinterArc2026!');
    setError(null);
  };

  const handleApiChange = (newUrl: string) => {
    setApiUrl(newUrl);
    setActiveApiUrl(newUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4 relative"
      style={{ backgroundImage: "url('/assets/login-bg.png')" }}
    >
      {/* Dark Ambient Frosted Backdrop Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan items-center justify-center shadow-lg shadow-primary/30 mb-4 border border-white/10">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2 drop-shadow-md">
            WINTER ARC <span className="text-primary-light">PRO</span>
          </h1>
          <p className="text-xs text-slate-300 font-mono mt-1 drop-shadow">Enterprise Administration Console</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/80 bg-surface-100/95 backdrop-blur-md p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/70">
            <ShieldCheck className="h-5 w-5 text-accent-cyan" />
            <h2 className="text-sm font-semibold text-slate-200">Administrator Sign In</h2>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-accent-rose/10 border border-accent-rose/20 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-accent-rose shrink-0 mt-0.5" />
              <p className="text-xs text-accent-rose leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@winterarc.pro"
                className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white px-4 py-2.5 text-xs font-semibold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Access Admin Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill & Server Config */}
          <div className="mt-6 pt-5 border-t border-border/70 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-surface-200 hover:bg-surface-300 border border-border px-3 py-2 text-xs font-medium text-slate-300 transition-colors"
            >
              <Key className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Fill Default Root Admin Credentials</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-mono truncate max-w-[260px]">
                <Server className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="text-slate-500">API:</span>
                <span className="text-slate-300 truncate">{apiUrl}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-primary-light hover:underline font-medium text-[11px]"
              >
                {showConfig ? 'Hide' : 'Switch API'}
              </button>
            </div>

            {showConfig && (
              <div className="p-3 rounded-lg bg-surface-200 border border-border flex flex-col gap-2">
                <span className="text-[11px] text-slate-400">Target Backend Server:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApiChange('https://springboot-igj8.onrender.com')}
                    className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium border ${
                      apiUrl.includes('onrender.com')
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-100 text-slate-300 border-border hover:bg-surface-300'
                    }`}
                  >
                    Cloud (Render)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApiChange('http://localhost:8080')}
                    className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium border ${
                      apiUrl.includes('localhost')
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-100 text-slate-300 border-border hover:bg-surface-300'
                    }`}
                  >
                    Local (8080)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
