import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  Copy,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  X
} from 'lucide-react';
import api from '../services/api';
import { CATEGORIES } from './LandingPage';
import { useAuth } from '../context/AuthContext';

export default function RequestRepairPage({
  initialCategory = '',
  initialProblem = '',
  setActivePage,
  setTrackingIdInput
}) {
  const { user } = useAuth();

  const [category, setCategory] = useState(initialCategory || 'Mobile Repair');
  const [problem, setProblem] = useState(initialProblem || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [urgency, setUrgency] = useState('medium');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 - 12:00');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialProblem) setProblem(initialProblem);
  }, [initialCategory, initialProblem]);

  // Set default preferred date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreferredDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!problem.trim()) {
      setErrorMessage('Please describe the problem.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide your service location / address.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('repair_type', category);
      formData.append('problem', problem.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      formData.append('urgency', urgency);
      formData.append('preferred_date', preferredDate);
      formData.append('preferred_time', preferredTime);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await api.requests.create(formData);
      if (res.success && res.data) {
        setSuccessData(res.data);
      } else {
        throw new Error(res.message || 'Failed to submit repair request.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Submission error. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (successData?.id) {
      navigator.clipboard.writeText(successData.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackCreated = () => {
    if (successData?.id) {
      if (setTrackingIdInput) setTrackingIdInput(successData.id);
      setActivePage('track');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2.5rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-accepted" style={{ marginBottom: '0.75rem' }}>
          <Wrench size={13} /> Easy Online Booking
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Book a Repair Service
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
          Submit your repair details. A certified technician will review your case and provide an upfront quote.
        </p>
      </div>

      {/* Success Dialog */}
      {successData ? (
        <div className="card card-padded" style={{ textAlign: 'center', padding: '3.5rem 2rem', background: '#ffffff', border: '2px solid #bbf7d0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Repair Request Registered!
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.75rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
            Your repair ticket has been created in the RepairHub system. Use this unique tracking ID to monitor technician assignment and progress.
          </p>

          {/* Ticket ID Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Your Tracking ID
              </span>
              <strong style={{ fontSize: '1.4rem', fontFamily: 'JetBrains Mono, monospace', color: '#2563eb' }}>
                {successData.id}
              </strong>
            </div>
            <button
              onClick={handleCopyId}
              className="btn btn-secondary btn-sm"
              title="Copy ID"
              id="btn-copy-ticket-id"
            >
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleTrackCreated}
              className="btn btn-primary btn-lg"
              id="btn-track-new-request"
            >
              Track Repair Progress Now <ArrowRight size={18} />
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setProblem('');
                removeImage();
              }}
              className="btn btn-secondary btn-lg"
            >
              Book Another Repair
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <form onSubmit={handleSubmit} className="card card-padded" style={{ background: '#ffffff' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '0.9rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertTriangle size={16} /> {errorMessage}
            </div>
          )}

          {/* Step 1: Category selection */}
          <div className="form-group">
            <label className="form-label">1. Select Repair Category *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '0.5rem'
              }}
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      borderRadius: '10px',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    id={`select-cat-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div style={{ color: isSelected ? '#2563eb' : '#64748b' }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e40af' : '#334155' }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Describe the problem */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ margin: 0 }}>2. Describe the Problem *</label>
              <button
                type="button"
                onClick={() => setActivePage('ai')}
                style={{ fontSize: '0.8rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
              >
                <Sparkles size={13} /> Need help? Ask AI Diagnostic Assistant
              </button>
            </div>
            <textarea
              className="form-textarea"
              placeholder="e.g. iPhone 13 display got green vertical lines after drops. Touch responds intermittently."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={4}
              required
              id="input-repair-problem"
            />
          </div>

          {/* Step 3: Optional Image Upload */}
          <div className="form-group">
            <label className="form-label">3. Upload Photo of the Issue (Optional)</label>
            {previewUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '0.5rem' }}>
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  style={{ maxHeight: '180px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#dc2626',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              >
                <Upload size={24} color="#64748b" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  Click to browse image or photo
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="input-repair-image"
                />
              </label>
            )}
          </div>

          {/* Step 4: Contact & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  id="input-repair-phone"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level</label>
              <select
                className="form-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                id="select-repair-urgency"
              >
                <option value="low">Standard (3 - 5 days)</option>
                <option value="medium">Medium Priority (1 - 2 days)</option>
                <option value="high">High Priority (Within 24 hrs)</option>
                <option value="emergency">Emergency / Same-Day Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Address / Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 104 Campus Walk, Tower B, Apt 401"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              id="input-repair-address"
            />
          </div>

          {/* Step 5: Schedule preference */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Preferred Date</label>
              <input
                type="date"
                className="form-input"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                id="input-preferred-date"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time Slot</label>
              <select
                className="form-select"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                id="select-preferred-time"
              >
                <option value="09:00 - 11:00">Morning (09:00 AM - 11:00 AM)</option>
                <option value="11:00 - 13:00">Noon (11:00 AM - 01:00 PM)</option>
                <option value="14:00 - 16:00">Afternoon (02:00 PM - 04:00 PM)</option>
                <option value="16:00 - 18:00">Late Afternoon (04:00 PM - 06:00 PM)</option>
                <option value="18:00 - 20:00">Evening (06:00 PM - 08:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontSize: '1.05rem' }}
            id="btn-submit-repair-request"
          >
            {submitting ? 'Registering Ticket...' : 'Confirm & Submit Repair Request'}
          </button>
        </form>
      )}
    </div>
  );
}
