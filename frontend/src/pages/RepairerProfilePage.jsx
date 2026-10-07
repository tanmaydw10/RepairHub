import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  Wrench,
  Award,
  Save,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RepairerProfilePage({ setActivePage }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service_categories: '',
    service_area: '',
    bio: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await api.repairer.getProfile();
        if (res.success && res.data) {
          setProfile(res.data);
          setFormData({
            name: res.data.name || user?.name || '',
            phone: res.data.phone || user?.phone || '',
            service_categories: res.data.service_categories || 'Mobile Repair, Laptop Repair',
            service_area: res.data.service_area || 'Tech Valley Area',
            bio: res.data.bio || ''
          });
        }
      } catch (err) {
        console.warn('Profile fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.repairer.updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setProfile(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '2.5rem auto 5rem', padding: '0 1.5rem' }}>
      <button
        onClick={() => setActivePage('repairer-dashboard')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={14} /> Back to Technician Dashboard
      </button>

      {/* Profile Overview Card */}
      <div className="card card-padded" style={{ marginBottom: '2rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e40af, #2563eb)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800
            }}
          >
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'M'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {formData.name || 'Marcus Vance'}
              </h1>
              <span className="badge badge-accepted">
                <Award size={13} /> Certified Specialist
              </span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {formData.bio || 'Master technician specializing in board-level electronics and domestic appliances.'}
            </p>
          </div>
        </div>

        {/* Stats metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Technician Rating</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={18} fill="#d97706" /> {profile?.rating || '4.9'} / 5.0
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Completed Repairs</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a' }}>
              {profile?.completed_repairs || 48} Jobs
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Coverage Area</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              {formData.service_area || 'Greater Metro'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card card-padded" style={{ background: '#ffffff' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
          Edit Profile Information
        </h2>

        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Categories Handled</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mobile Repair, Laptop Repair, AC Repair"
              value={formData.service_categories}
              onChange={(e) => setFormData({ ...formData, service_categories: e.target.value })}
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Comma-separated categories you are certified to service.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Service Area</label>
            <input
              type="text"
              className="form-input"
              value={formData.service_area}
              onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio & Professional Certifications</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
