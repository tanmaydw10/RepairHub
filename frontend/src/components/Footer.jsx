import React from 'react';
import { Wrench, Shield, Clock, Award, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onCategoryClick, setActivePage }) {
  const categories = [
    'Mobile Repair',
    'Laptop Repair',
    'Computer Repair',
    'TV Repair',
    'AC Repair',
    'Refrigerator Repair',
    'Washing Machine Repair'
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand column */}
        <div>
          <div className="brand-logo" style={{ color: '#ffffff', marginBottom: '1rem' }}>
            <div className="brand-icon-box" style={{ background: '#2563eb' }}>
              <Wrench size={20} />
            </div>
            <span>Repair<span style={{ color: '#60a5fa' }}>Hub</span></span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8', maxWidth: '320px', marginBottom: '1.5rem' }}>
            The smart, verified repair ecosystem for electronics and home appliances. Connect with background-checked specialists with upfront pricing and live tracking.
          </p>
          <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Shield size={14} color="#38bdf8" /> 90-Day Warranty</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Award size={14} color="#38bdf8" /> Certified Pros</span>
          </div>
        </div>

        {/* Categories column */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>Services</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {categories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => {
                    if (onCategoryClick) onCategoryClick(cat);
                  }}
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>Quick Access</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li>
              <button
                onClick={() => setActivePage('request')}
                style={{ color: '#94a3b8', fontSize: '0.875rem' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                Book a Service
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('track')}
                style={{ color: '#94a3b8', fontSize: '0.875rem' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                Track Live Repair
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('ai')}
                style={{ color: '#94a3b8', fontSize: '0.875rem' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                AI Diagnostic Assistant
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('login')}
                style={{ color: '#94a3b8', fontSize: '0.875rem' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                id="footer-link-signin"
              >
                Sign In
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('register')}
                style={{ color: '#94a3b8', fontSize: '0.875rem' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                id="footer-link-register"
              >
                Create Account
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('repairer-login')}
                style={{ color: '#94a3b8', fontSize: '0.875rem' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                Technician Portal
              </button>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>Support & Help</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Phone size={15} color="#38bdf8" />
              <span>+1 (800) 555-REPAIR</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Mail size={15} color="#38bdf8" />
              <span>support@repairhub.local</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={15} color="#38bdf8" />
              <span>San Francisco & Nationwide</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={15} color="#38bdf8" />
              <span>Mon - Sun: 8:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} RepairHub Platform. Advanced Full-Stack Architecture.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b' }}>
          <span>PostgreSQL + Express + React + Vite</span>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}
