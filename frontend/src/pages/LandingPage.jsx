import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Monitor,
  Tv,
  Wind,
  Refrigerator,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Star,
  Search,
  Wrench,
  ThumbsUp,
  Cpu,
  Layers
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatINR } from '../utils/formatters';
import { getPlatformStats } from '../constants/platformStats';

export const CATEGORIES = [
  {
    id: 'Mobile Repair',
    name: 'Mobile Repair',
    icon: Smartphone,
    desc: 'Screen replacement, battery degradation, charging ports, water damage & logic board fixes.',
    avgTime: 'Same Day (2 hrs)',
    color: '#3b82f6',
    bg: '#eff6ff'
  },
  {
    id: 'Laptop Repair',
    name: 'Laptop Repair',
    icon: Laptop,
    desc: 'Motherboard micro-soldering, battery replacements, hinge repair, thermal repasting & OS.',
    avgTime: '24 - 48 hrs',
    color: '#6366f1',
    bg: '#eef2ff'
  },
  {
    id: 'Computer Repair',
    name: 'Computer Repair',
    icon: Monitor,
    desc: 'Custom PC diagnosis, power supply failures, GPU glitches, storage upgrades & virus cleansing.',
    avgTime: '24 hrs',
    color: '#0284c7',
    bg: '#f0f9ff'
  },
  {
    id: 'TV Repair',
    name: 'TV Repair',
    icon: Tv,
    desc: 'LED backlight replacement, panel timing issues, sound board & power circuitry repairs.',
    avgTime: '1 - 2 days',
    color: '#0d9488',
    bg: '#f0fdfa'
  },
  {
    id: 'AC Repair',
    name: 'AC Repair',
    icon: Wind,
    desc: 'Compressor maintenance, gas pressure recharge, PCB controller repair & coil leak sealing.',
    avgTime: 'Doorstep (3 hrs)',
    color: '#0891b2',
    bg: '#ecfeff'
  },
  {
    id: 'Refrigerator Repair',
    name: 'Refrigerator Repair',
    icon: Refrigerator,
    desc: 'Thermostat adjustment, compressor starter relay replacement, defrost heater & seal fixes.',
    avgTime: 'Doorstep (4 hrs)',
    color: '#2563eb',
    bg: '#eff6ff'
  },
  {
    id: 'Washing Machine Repair',
    name: 'Washing Machine Repair',
    icon: Wrench,
    desc: 'Drum bearing repair, drain pump clearing, belt replacement, motor brushes & control panels.',
    avgTime: 'Doorstep (Same Day)',
    color: '#7c3aed',
    bg: '#f5f3ff'
  },
  {
    id: 'Other',
    name: 'Other Electronics',
    icon: Cpu,
    desc: 'Microwaves, gaming consoles, audio receivers, smart home hardware and specialty devices.',
    avgTime: 'Custom Quote',
    color: '#475569',
    bg: '#f8fafc'
  }
];

export default function LandingPage({ setActivePage, setSelectedCategory, setTrackingIdInput }) {
  const [quickTrackId, setQuickTrackId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [platformStats, setPlatformStats] = useState(getPlatformStats());

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [reviewsRes, statsRes] = await Promise.allSettled([
          api.reviews.list(),
          api.repairer.getStats()
        ]);

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.success && reviewsRes.value?.data) {
          setReviews(reviewsRes.value.data);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value?.stats) {
          setPlatformStats(getPlatformStats(statsRes.value.stats));
        }
      } catch (err) {
        console.warn('Could not fetch landing page data:', err.message);
      }
    }
    fetchPageData();
  }, []);

  const handleCategorySelect = (categoryName) => {
    if (setSelectedCategory) setSelectedCategory(categoryName);
    setActivePage('request');
  };

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      if (setTrackingIdInput) setTrackingIdInput(quickTrackId.trim().toUpperCase());
      setActivePage('track');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div>
            <div className="hero-tag">
              <Sparkles size={16} /> Certified Repair Network & AI Diagnosis
            </div>

            <h1 className="hero-title">
              Fast, transparent repairs for <span>every device</span> you rely on.
            </h1>

            <p className="hero-description">
              Connect with vetted local repair specialists in minutes. Upfront estimates, doorstep appointments, and real-time step-by-step repair tracking.
            </p>

            <div className="hero-actions">
              <button
                onClick={() => setActivePage('request')}
                className="btn btn-primary btn-lg"
                id="hero-btn-book"
              >
                Find a Repair Specialist <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setActivePage('track')}
                className="btn btn-secondary btn-lg"
                id="hero-btn-track"
              >
                <Search size={18} /> Track Repair
              </button>
            </div>

            {/* Quick Track Input Bar */}
            <form onSubmit={handleQuickTrack} style={{ display: 'flex', gap: '0.5rem', maxWidth: '460px', marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder="Already have a ticket? Enter Request ID (e.g. RH-2024-001)"
                value={quickTrackId}
                onChange={(e) => setQuickTrackId(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.875rem' }}
                id="hero-quick-track-input"
              />
              <button type="submit" className="btn btn-secondary btn-sm" id="hero-quick-track-btn">
                Track
              </button>
            </form>

            {/* Centralized & Responsive Platform Statistics */}
            <div className="hero-stats-row">
              {platformStats.map((item) => (
                <div key={item.id} className="hero-stat-item">
                  <h4>{item.value}</h4>
                  <p>{item.label}</p>
                  <span>{item.subtext}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Live Tracker Preview Card */}
          <div>
            <div className="hero-preview-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Live Demo Tracker</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Ticket #RH-2024-001</h3>
                </div>
                <StatusBadge status="In Progress" />
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <Laptop size={18} color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>MacBook Pro 14"</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Display flickering and ultrasonic logic board cleaning.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Assigned Specialist</span>
                  <strong>Marcus Vance</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Estimated Cost</span>
                  <strong style={{ color: '#2563eb' }}>{formatINR(12499, { showDecimals: true })}</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Ultrasonic Bath Complete</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Display cable replacement ongoing</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (setTrackingIdInput) setTrackingIdInput('RH-2024-001');
                  setActivePage('track');
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '1.25rem' }}
                id="hero-preview-view-full"
              >
                Inspect Live Tracking Details <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Repair Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <p className="section-subtitle">Comprehensive Coverage</p>
          <h2 className="section-title">Popular Repair Categories</h2>
          <p className="section-desc">
            Select your equipment below to get matched with specialized master technicians certified for your brand.
          </p>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => handleCategorySelect(cat.id)}
                id={`cat-card-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div>
                  <div className="category-icon-box" style={{ backgroundColor: cat.bg, color: cat.color }}>
                    <Icon size={26} strokeWidth={2.2} />
                  </div>
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-desc">{cat.desc}</p>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
                    ⚡ Turnaround: {cat.avgTime}
                  </div>
                  <div className="category-action">
                    Book This Repair <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Assistant Teaser Banner */}
      <section style={{ maxWidth: '1280px', margin: '0 auto 4.5rem', padding: '0 1.5rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            color: '#ffffff',
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.6fr',
            gap: '2rem',
            alignItems: 'center',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.25)'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.825rem',
                fontWeight: 700,
                marginBottom: '1rem',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}
            >
              <Sparkles size={14} /> AI Symptom Analyzer
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.85rem', lineHeight: 1.25 }}>
              Not sure what is broken? Ask our AI Assistant.
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem', maxWidth: '580px' }}>
              Describe your device's strange noises, flickering, or errors in plain English. The AI evaluates possible root causes, estimates repair costs, and suggests safe next steps.
            </p>
            <button
              onClick={() => setActivePage('ai')}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}
              id="cta-try-ai-assistant"
            >
              <Sparkles size={16} /> Try Free AI Diagnostic Assistant
            </button>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Example Query</div>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '1rem' }}>
              "My AC indoor blower is blowing warm air and the outdoor compressor hums every 2 minutes without spinning."
            </p>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>✓ AI Output:</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Defective Run Capacitor or Low Refrigerant (₹1,800 - ₹4,800)</div>
            </div>
          </div>
        </div>
      </section>

      {/* How RepairHub Works */}
      <section className="how-it-works-section">
        <div className="section-header">
          <p className="section-subtitle">Effortless Process</p>
          <h2 className="section-title">How RepairHub Works</h2>
          <p className="section-desc">
            Getting your hardware fixed is hassle-free from request to completion.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">
              <Laptop size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.65rem' }}>Describe Your Issue</h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.55 }}>
              Choose your device category, attach an optional image, and select your preferred doorstep slot and urgency.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.65rem' }}>Specialist Assignment</h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.55 }}>
              A certified, background-checked technician reviews your ticket, gives an upfront cost estimate, and accepts the work.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.65rem' }}>Live Tracking & Warranty</h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.55 }}>
              Follow every step through real-time status updates, inspect technician notes, and enjoy an included 90-day guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits / Features */}
      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="section-header">
          <p className="section-subtitle">Why RepairHub</p>
          <h2 className="section-title">Engineered for Reliability</h2>
          <p className="section-desc">
            We eliminate the uncertainty, hidden fees, and delays of traditional neighborhood repair shops.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          <div className="card card-padded">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verified Technicians</h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              Every repairer undergoes background verification, skill assessment tests, and ongoing performance monitoring.
            </p>
          </div>

          <div className="card card-padded">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Clock size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Upfront Transparent Pricing</h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              Receive detailed cost breakdowns before any work begins. No unexpected diagnostic charges or surprise labor hikes.
            </p>
          </div>

          <div className="card card-padded">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Search size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Public Tracking Engine</h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              Track the exact status of your repair anywhere, on any device using just your unique Request ID.
            </p>
          </div>

          <div className="card card-padded">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ThumbsUp size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Genuine Replacement Parts</h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              Technicians only install grade-A OEM certified parts backed by our nationwide 90-day replacement warranty.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <section style={{ backgroundColor: '#ffffff', padding: '4rem 1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <p className="section-subtitle">Real Customer Feedback</p>
            <h2 className="section-title">Trusted by Thousands</h2>
            <p className="section-desc">Read reviews from customers who solved their hardware problems on RepairHub.</p>
          </div>

          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {reviews.slice(0, 3).map((rev) => (
              <div key={rev.id} className="card card-padded" style={{ backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#eab308' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#eab308" />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '0.925rem', color: '#334155', marginBottom: '1rem', lineHeight: 1.5 }}>
                  "{rev.review}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', color: '#64748b' }}>
                  <strong>{rev.customer_name || 'Verified Customer'}</strong>
                  <span className="badge badge-accepted">{rev.repair_type || 'Repair'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call To Action Banner */}
      <section style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to restore your device?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            Book a repair in under 60 seconds. Our certified specialists are ready to assist.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActivePage('request')}
              className="btn btn-secondary btn-lg"
              style={{ fontWeight: 700 }}
              id="cta-bottom-book"
            >
              Book Service Now
            </button>
            <button
              onClick={() => setActivePage('track')}
              className="btn btn-outline btn-lg"
              style={{ color: '#ffffff', borderColor: '#ffffff' }}
              id="cta-bottom-track"
            >
              Track Existing Request
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
