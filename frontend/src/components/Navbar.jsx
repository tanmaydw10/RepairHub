import React, { useState } from 'react';
import { Wrench, Sparkles, Search, User, ShieldCheck, LogOut, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, isRepairer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Brand Logo */}
        <button
          onClick={() => setActivePage('landing')}
          className="brand-logo"
          style={{ cursor: 'pointer' }}
          id="nav-brand-logo"
        >
          <div className="brand-icon-box">
            <Wrench size={20} strokeWidth={2.4} />
          </div>
          <span>Repair<span style={{ color: '#2563eb' }}>Hub</span></span>
        </button>

        {/* Navigation Links */}
        <div className="nav-links">
          <button
            onClick={() => setActivePage('landing')}
            className={`nav-link ${activePage === 'landing' ? 'active' : ''}`}
            id="nav-link-home"
          >
            Home
          </button>
          <button
            onClick={() => setActivePage('request')}
            className={`nav-link ${activePage === 'request' ? 'active' : ''}`}
            id="nav-link-book"
          >
            Book Repair
          </button>
          <button
            onClick={() => setActivePage('track')}
            className={`nav-link ${activePage === 'track' ? 'active' : ''}`}
            id="nav-link-track"
          >
            <Search size={15} /> Track Repair
          </button>
          <button
            onClick={() => setActivePage('ai')}
            className={`nav-link ${activePage === 'ai' ? 'active' : ''}`}
            id="nav-link-ai"
          >
            <Sparkles size={15} style={{ color: '#0284c7' }} /> AI Assistant
          </button>

          {user && (
            <button
              onClick={() => setActivePage('customer-profile')}
              className={`nav-link ${activePage === 'customer-profile' ? 'active' : ''}`}
              id="nav-link-myrepairs"
            >
              My Repairs
            </button>
          )}

          {isRepairer && (
            <button
              onClick={() => setActivePage('repairer-dashboard')}
              className={`nav-link ${activePage === 'repairer-dashboard' ? 'active' : ''}`}
              style={{ color: '#2563eb', fontWeight: 700 }}
              id="nav-link-technician-hub"
            >
              <ShieldCheck size={16} /> Technician Hub
            </button>
          )}
        </div>

        {/* Auth / Action Buttons */}
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: '#f1f5f9',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155'
                }}
              >
                <User size={15} />
                <span>{user.name.split(' ')[0]}</span>
                <span className={`badge ${user.role === 'repairer' ? 'badge-accepted' : 'badge-role'}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Sign out"
                id="btn-logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => navigateTo('repairer-login')}
                className="btn btn-secondary btn-sm"
                id="btn-nav-tech-login"
              >
                <ShieldCheck size={14} /> Repairer Portal
              </button>
              <button
                onClick={() => navigateTo('request')}
                className="btn btn-primary btn-sm"
                id="btn-nav-book-repair"
              >
                Book a Repair <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-toggle-btn"
            style={{ display: 'none', padding: '0.45rem' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigateTo('landing')}
            className={`nav-link ${activePage === 'landing' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left' }}
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('request')}
            className={`nav-link ${activePage === 'request' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left' }}
          >
            Book Repair
          </button>
          <button
            onClick={() => navigateTo('track')}
            className={`nav-link ${activePage === 'track' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <Search size={15} /> Track Repair
          </button>
          <button
            onClick={() => navigateTo('ai')}
            className={`nav-link ${activePage === 'ai' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <Sparkles size={15} color="#0284c7" /> AI Diagnostic Assistant
          </button>
          {user && (
            <button
              onClick={() => navigateTo('customer-profile')}
              className={`nav-link ${activePage === 'customer-profile' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left' }}
            >
              My Repairs
            </button>
          )}
          {isRepairer && (
            <button
              onClick={() => navigateTo('repairer-dashboard')}
              className={`nav-link ${activePage === 'repairer-dashboard' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', color: '#2563eb', fontWeight: 700 }}
            >
              <ShieldCheck size={16} /> Technician Hub
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
