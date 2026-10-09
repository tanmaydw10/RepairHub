import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Phone, MapPin, ArrowRight, AlertCircle, Wrench, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RepairerLoginPage({ setActivePage }) {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCategories, setServiceCategories] = useState('Mobile Repair, Laptop Repair, Computer Repair');
  const [serviceArea, setServiceArea] = useState('Tech Valley Metro Area');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        await register({
          name,
          email,
          password,
          role: 'repairer',
          phone,
          service_categories: serviceCategories,
          service_area: serviceArea
        });
      } else {
        await login(email, password);
      }
      setActivePage('repairer-dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoTechnicianLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('repairer@repairhub.local', 'password123');
      setActivePage('repairer-dashboard');
    } catch (err) {
      setError(err.message || 'Demo technician login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomerLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('customer@repairhub.local', 'password123');
      setActivePage('customer-profile');
    } catch (err) {
      setError(err.message || 'Demo customer login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3.5rem auto 5rem', padding: '0 1.5rem' }}>
      <div className="card card-padded" style={{ background: '#ffffff', boxShadow: 'var(--shadow-xl)' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            {isRegisterMode ? 'Join as Technician' : 'Technician Portal'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {isRegisterMode
              ? 'Create a certified repair provider account'
              : 'Sign in to access ticket management & dispatch'}
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            ⚡ 1-Click Demo Accounts
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <button
              type="button"
              onClick={handleDemoTechnicianLogin}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', borderColor: '#bfdbfe', background: '#eff6ff', color: '#1e40af' }}
              id="btn-demo-repairer-login"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={14} /> <strong>Marcus Vance</strong> (Lead Technician)
              </span>
              <span style={{ fontSize: '0.75rem', background: '#dbeafe', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Sign in</span>
            </button>

            <button
              type="button"
              onClick={handleDemoCustomerLogin}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between' }}
              id="btn-demo-customer-login"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> Alex Johnson (Customer)
              </span>
              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Sign in</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Specialties</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mobile Repair, Laptop Repair"
                  value={serviceCategories}
                  onChange={(e) => setServiceCategories(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Area</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Downtown & Metro Area"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="repairer@repairhub.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="input-repairer-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-action">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="input-repairer-password"
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

          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-action">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  id="input-repairer-confirm-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            id="btn-submit-repairer-login"
          >
            {loading ? 'Authenticating...' : (isRegisterMode ? 'Register Technician' : 'Sign In to Dashboard')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          {isRegisterMode ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                style={{ color: '#2563eb', fontWeight: 700 }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New technician?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                style={{ color: '#2563eb', fontWeight: 700 }}
              >
                Register an Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
