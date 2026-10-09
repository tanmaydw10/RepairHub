import React, { useState } from 'react';
import { LogIn, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Wrench, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignInPage({ setActivePage, redirectAfterLogin }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      const user = res.user;

      if (redirectAfterLogin) {
        setActivePage(redirectAfterLogin);
      } else if (user && (user.role === 'repairer' || user.role === 'admin')) {
        setActivePage('repairer-dashboard');
      } else {
        setActivePage('customer-profile');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoRole) => {
    setError('');
    setLoading(true);
    try {
      const res = await login(demoEmail, 'password123');
      const user = res.user;
      if (user && (user.role === 'repairer' || user.role === 'admin')) {
        setActivePage('repairer-dashboard');
      } else {
        setActivePage('customer-profile');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3.5rem auto 5rem', padding: '0 1.25rem' }}>
      <div className="card card-padded" style={{ background: '#ffffff', boxShadow: 'var(--shadow-xl)', borderRadius: 'var(--radius-lg)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.1rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            <LogIn size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Sign In to RepairHub
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.45 }}>
            Access your active repairs, real-time tracking, or technician workspace
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚡ 1-Click Fast Login
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Demo Credentials</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('customer@repairhub.local', 'customer')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.825rem' }}
              id="btn-demo-signin-customer"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={14} color="#2563eb" /> Alex Johnson (Customer)
              </span>
              <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1e40af', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                Customer
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('repairer@repairhub.local', 'repairer')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.825rem', borderColor: '#bfdbfe', background: '#f0f9ff' }}
              id="btn-demo-signin-repairer"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Wrench size={14} color="#0284c7" /> Marcus Vance (Lead Tech)
              </span>
              <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                Technician
              </span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
            role="alert"
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">
              Email Address
            </label>
            <div className="input-with-action">
              <input
                id="signin-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" htmlFor="signin-password" style={{ marginBottom: 0 }}>
                Password
              </label>
            </div>
            <div className="input-with-action">
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem', fontSize: '0.975rem' }}
            id="btn-submit-signin"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Sign In <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => setActivePage('register')}
            style={{ color: '#2563eb', fontWeight: 700 }}
            id="btn-switch-to-register"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
