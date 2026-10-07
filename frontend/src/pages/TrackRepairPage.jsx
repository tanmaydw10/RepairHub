import React, { useState, useEffect } from 'react';
import {
  Search,
  Wrench,
  Calendar,
  Clock,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Star,
  FileText,
  MapPin,
  Phone,
  ImageIcon,
  Receipt,
  Printer,
  X,
  ShieldCheck
} from 'lucide-react';
import api, { getMediaUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatINR } from '../utils/formatters';

export default function TrackRepairPage({ initialTrackingId = '', setActivePage }) {
  const [trackingId, setTrackingId] = useState(initialTrackingId || 'RH-2024-001');
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Rating state
  const [ratingVal, setRatingVal] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const handleTrack = async (idToFetch) => {
    const queryId = (idToFetch || trackingId).trim().toUpperCase();
    if (!queryId) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.requests.track(queryId);
      if (res.success && res.data) {
        setRequestData(res.data);
      } else {
        setError(res.message || 'Ticket not found.');
      }
    } catch (err) {
      setError(err.message || 'Unable to find a repair request with this ID.');
      setRequestData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      handleTrack(initialTrackingId);
    } else {
      // Auto-load demo ticket on start
      handleTrack('RH-2024-001');
    }
  }, [initialTrackingId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    setReviewSuccess('');

    try {
      const res = await api.reviews.create({
        request_id: requestData.id,
        rating: ratingVal,
        review: reviewText.trim()
      });

      if (res.success) {
        setReviewSuccess('Thank you for rating your service!');
        // Refresh request data to display new review
        handleTrack(requestData.id);
      }
    } catch (err) {
      setError(err.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '2.5rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
          Track Your Repair Request
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
          Enter your unique Request ID to see real-time technician notes, scheduling, and diagnostic milestones.
        </p>
      </div>

      {/* Search Bar */}
      <div className="card card-padded" style={{ marginBottom: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Enter Request ID (e.g. RH-2024-001)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', textTransform: 'uppercase' }}
              id="input-track-id"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem' }}
            id="btn-search-tracking"
          >
            <Search size={16} /> {loading ? 'Searching...' : 'Track Ticket'}
          </button>
        </form>

        {/* Quick Demo ID chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#64748b' }}>
          <span>Try quick demo tickets:</span>
          {['RH-2024-001', 'RH-2024-002', 'RH-2024-003'].map((demoId) => (
            <button
              key={demoId}
              type="button"
              onClick={() => {
                setTrackingId(demoId);
                handleTrack(demoId);
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#2563eb',
                fontWeight: 600
              }}
            >
              {demoId}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Tracking Details View */}
      {requestData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
          {/* Main Ticket Information */}
          <div className="card card-padded">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Repair Ticket
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
                  {requestData.id}
                </h2>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563eb', marginTop: '0.2rem' }}>
                  {requestData.repair_type}
                </div>
              </div>
              <StatusBadge status={requestData.status} />
            </div>

            {/* Problem statement */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Reported Problem
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#1e293b', background: '#f8fafc', padding: '0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9', lineHeight: 1.5 }}>
                {requestData.problem}
              </p>
            </div>

            {/* Uploaded photo if present */}
            {requestData.image_url && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Attached Photo
                </h4>
                <div style={{ maxWidth: '300px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img
                    src={getMediaUrl(requestData.image_url)}
                    alt="Device problem"
                    style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            {/* Key Grid Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Assigned Specialist</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={15} color="#2563eb" /> {requestData.repairer_name || 'Assigning soon...'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Estimated Cost</span>
                <strong style={{ fontSize: '1.1rem', color: requestData.estimated_cost ? '#16a34a' : '#64748b' }}>
                  {formatINR(requestData.estimated_cost, { showDecimals: true })}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Appointment Slot</span>
                <span style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> {requestData.preferred_date || 'Flexible'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <Clock size={13} /> {requestData.preferred_time || 'Standard window'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Urgency Level</span>
                <span className="badge badge-role" style={{ textTransform: 'capitalize' }}>
                  {requestData.urgency || 'Medium'}
                </span>
              </div>
            </div>

            {/* Technician notes */}
            {requestData.repair_notes && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <FileText size={15} /> Specialist Diagnostic Notes:
                </div>
                <p style={{ fontSize: '0.9rem', color: '#14532d', margin: 0 }}>
                  {requestData.repair_notes}
                </p>
              </div>
            )}

            {/* Contact & Location info */}
            <div style={{ fontSize: '0.825rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={13} /> Contact: {requestData.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} /> Service Location: {requestData.address}
              </div>
            </div>
          </div>

          {/* Right Column: Timeline & Review Form */}
          <div>
            {/* Timeline Card */}
            <div className="card card-padded" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                Repair Milestones
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Live chronological updates on your hardware.
              </p>

              <div className="timeline">
                {requestData.timeline && requestData.timeline.length > 0 ? (
                  requestData.timeline.map((update, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot" />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <StatusBadge status={update.status} />
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.3rem 0 0.15rem' }}>
                        {update.note}
                      </p>
                      <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                        By: {update.created_by || 'Specialist'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    No updates logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* Rating & Review Section (Only when Completed) */}
            {requestData.status === 'Completed' && (
              <div className="card card-padded" style={{ border: '2px solid #86efac', background: '#f0fdf4' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={18} fill="#eab308" color="#eab308" /> Rate & Review Service
                </h3>

                {requestData.review ? (
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.2rem', color: '#eab308', marginBottom: '0.4rem' }}>
                      {[...Array(requestData.review.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="#eab308" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#14532d', fontStyle: 'italic', margin: 0 }}>
                      "{requestData.review.review}"
                    </p>
                    <span style={{ fontSize: '0.725rem', color: '#64748b', display: 'block', marginTop: '0.4rem' }}>
                      Reviewed on {new Date(requestData.review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} style={{ marginTop: '0.75rem' }}>
                    {reviewSuccess && (
                      <div style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        {reviewSuccess}
                      </div>
                    )}
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14532d', display: 'block', marginBottom: '0.35rem' }}>
                      Your Rating:
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingVal(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ cursor: 'pointer', padding: '2px' }}
                        >
                          <Star
                            size={22}
                            fill={(hoverRating || ratingVal) >= star ? '#eab308' : 'none'}
                            color={(hoverRating || ratingVal) >= star ? '#eab308' : '#94a3b8'}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="form-textarea"
                      placeholder="Share your experience with this repairer..."
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      style={{ background: '#ffffff', marginBottom: '0.75rem' }}
                      id="input-review-text"
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', background: '#16a34a' }}
                      id="btn-submit-review"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.75rem', borderColor: '#86efac', color: '#166534' }}
                  id="btn-view-receipt"
                >
                  <Receipt size={14} /> View Official Repair Receipt & Warranty
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Repair Receipt Modal */}
      {showReceiptModal && requestData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            className="card card-padded"
            style={{
              maxWidth: '650px',
              width: '100%',
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: 800 }}>
                <Receipt size={20} /> RepairHub Official Service Invoice
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  title="Print invoice"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Invoice Body */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Repair<span style={{ color: '#2563eb' }}>Hub</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Certified Hardware & Appliance Care</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Invoice / Ticket Ref:</span>
                  <strong style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#2563eb' }}>
                    {requestData.id}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Customer Contact:</span>
                  <strong>{requestData.phone}</strong>
                  <div style={{ color: '#64748b', marginTop: '0.2rem' }}>{requestData.address}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Servicing Specialist:</span>
                  <strong>{requestData.repairer_name || 'Master Technician'}</strong>
                  <div style={{ color: '#64748b', marginTop: '0.2rem' }}>Status: Completed & Quality Tested</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0' }}>Description</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem 0' }}>
                      <strong>{requestData.repair_type}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{requestData.problem}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0', textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(requestData.estimated_cost ? (parseFloat(requestData.estimated_cost) * 0.7) : 5950, { showDecimals: true })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem 0' }}>
                      <strong>Diagnostic & Ultrasonic Bench Labor</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Certified technician bench fee</div>
                    </td>
                    <td style={{ padding: '0.65rem 0', textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(requestData.estimated_cost ? (parseFloat(requestData.estimated_cost) * 0.3) : 2550, { showDecimals: true })}
                    </td>
                  </tr>
                  <tr style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    <td style={{ padding: '0.75rem 0' }}>Total Paid:</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', color: '#16a34a' }}>
                      {formatINR(requestData.estimated_cost || 8500, { showDecimals: true })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Warranty badge */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={26} color="#059669" />
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#065f46', display: 'block' }}>
                    90-Day Protection Certificate Active
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                    Parts and labor guaranteed against recurrence through {new Date(Date.now() + 90 * 86400000).toLocaleDateString()}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
