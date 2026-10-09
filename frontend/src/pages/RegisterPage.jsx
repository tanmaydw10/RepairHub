import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Wrench, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ setActivePage }) {
  const { register } = useAuth();

  const [role, setRole] = useState('customer'); // strictly 'customer' or 'repairer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCategories, setServiceCategories] = useState('Mobile Repair, Laptop Repair');
  const [serviceArea, setServiceArea] = useState('Bengaluru Metro Area');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!name.trim()) {
      return 'Please enter your full name.';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      return 'Please provide a valid email address.';
    }

    if (!password) {
      return 'Please enter a password.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match. Please ensure both passwords match.';
    }

    if (role === 'repairer' && !phone.trim()) {
      return 'Technicians must provide a contact phone number for job dispatch.';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        role: role === 'repairer' ? 'repairer' : 'customer',
        phone: phone.trim()
      };

      if (role === 'repairer') {
        payload.service_categories = serviceCategories.trim() || 'All Categories';
        payload.service_area = serviceArea.trim() || 'Citywide';
      }

      const res = await register(payload);
      const newUser = res.user;

      if (newUser && newUser.role === 'repairer') {
        setActivePage('repairer-dashboard');
      } else {
        setActivePage('customer-profile');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please review your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '3rem auto 5rem', padding: '0 1.25rem' }}>
      <div className="card card-padded" style={{ background: '#ffffff', boxShadow: 'var(--shadow-xl)', borderRadius: 'var(--radius-lg)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #0284c7)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.1rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            <UserPlus size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Create an Account
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.45 }}>
            Join RepairHub to book fast repairs or work as a certified technician
          </p>
        </div>

        {/* Role Selection Toggle */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>
            I am joining as:
          </label>
          <div className="auth-role-toggle">
            <button
              type="button"
              className={`auth-role-card ${role === 'customer' ? 'active' : ''}`}
              onClick={() => setRole('customer')}
              id="role-select-customer"
            >
              <div className="auth-role-card-header">
                <User size={16} />
                <span>Customer</span>
              </div>
              <div className="auth-role-card-desc">
                Book repairs, track live status, & review technicians
              </div>
            </button>

            <button
              type="button"
              className={`auth-role-card ${role === 'repairer' ? 'active' : ''}`}
              onClick={() => setRole('repairer')}
              id="role-select-repairer"
            >
              <div className="auth-role-card-header">
                <Wrench size={16} />
                <span>Technician</span>
              </div>
              <div className="auth-role-card-desc">
                Receive service requests & manage repair jobs
              </div>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name *
            </label>
            <div className="input-with-action">
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address *
            </label>
            <div className="input-with-action">
              <input
                id="register-email"
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

          {/* Phone (required for repairer, optional for customer) */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-phone">
              Phone Number {role === 'repairer' ? '*' : '(Optional)'}
            </label>
            <div className="input-with-action">
              <input
                id="register-phone"
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required={role === 'repairer'}
                disabled={loading}
              />
            </div>
          </div>

          {/* Additional Repairer Fields */}
          {role === 'repairer' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="register-specialties">
                  Service Specialties
                </label>
                <input
                  id="register-specialties"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mobile Repair, Laptop Repair, AC Repair"
                  value={serviceCategories}
                  onChange={(e) => setServiceCategories(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-area">
                  Service Area / Metro Region
                </label>
                <input
                  id="register-area"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bengaluru Metro, Indiranagar, Whitefield"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password (min. 6 characters) *
            </label>
            <div className="input-with-action">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              Confirm Password *
            </label>
            <div className="input-with-action">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '0.3rem', display: 'block' }}>
                Passwords do not match
              </span>
            )}
            {confirmPassword && password === confirmPassword && (
              <span style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} /> Passwords match
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem', fontSize: '0.975rem' }}
            id="btn-submit-register"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Creating your account...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Create Account <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setActivePage('login')}
            style={{ color: '#2563eb', fontWeight: 700 }}
            id="btn-switch-to-signin"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
