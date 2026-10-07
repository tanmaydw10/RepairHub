import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Filter,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  Phone,
  FileText,
  X,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Shield,
  Layers
} from 'lucide-react';
import api, { getMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES } from './LandingPage';
import { formatINR } from '../utils/formatters';

export default function RepairerDashboardPage({ setActivePage }) {
  const { user } = useAuth();

  // Stats state
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    activeRepairs: 0,
    completedRequests: 0,
    todaysRequests: 0,
    averageRating: 5.0,
    estimatedRevenue: 0
  });

  // Requests state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected request modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    estimated_cost: '',
    repairer_name: '',
    repair_notes: '',
    preferred_date: '',
    preferred_time: '',
    status_note: ''
  });
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reqsRes] = await Promise.all([
        api.repairer.getStats().catch(() => ({ stats: null })),
        api.requests.list({
          status: statusFilter !== 'all' ? statusFilter : '',
          repair_type: categoryFilter !== 'all' ? categoryFilter : '',
          search: searchQuery
        })
      ]);

      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (reqsRes && reqsRes.data) {
        setRequests(reqsRes.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openRequestModal = async (requestId) => {
    setModalLoading(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      const res = await api.requests.getById(requestId);
      if (res.success && res.data) {
        setSelectedRequest(res.data);
        setEditForm({
          status: res.data.status || 'Pending',
          estimated_cost: res.data.estimated_cost !== null ? res.data.estimated_cost : '',
          repairer_name: res.data.repairer_name || user?.name || '',
          repair_notes: res.data.repair_notes || '',
          preferred_date: res.data.preferred_date ? res.data.preferred_date.split('T')[0] : '',
          preferred_time: res.data.preferred_time || '',
          status_note: ''
        });
      }
    } catch (err) {
      console.error('Error loading request details:', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setSaveSuccess('');
    setSaveError('');
  };

  const handleQuickAccept = async (reqId) => {
    try {
      await api.requests.assign(reqId, {
        repairer_id: user?.id,
        repairer_name: user?.name || 'Marcus Vance',
        estimated_cost: 3500.00
      });
      fetchData();
    } catch (err) {
      alert(`Could not accept request: ${err.message}`);
    }
  };

  const handleQuickCancel = async (reqId) => {
    if (!window.confirm('Are you sure you want to cancel/reject this request?')) return;
    try {
      await api.requests.updateStatus(reqId, 'Cancelled', 'Technician cancelled or declined request.');
      fetchData();
    } catch (err) {
      alert(`Could not cancel request: ${err.message}`);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');

    try {
      const res = await api.requests.update(selectedRequest.id, {
        status: editForm.status,
        estimated_cost: editForm.estimated_cost ? parseFloat(editForm.estimated_cost) : null,
        repairer_name: editForm.repairer_name,
        repair_notes: editForm.repair_notes,
        preferred_date: editForm.preferred_date,
        preferred_time: editForm.preferred_time,
        status_note: editForm.status_note
      });

      if (res.success) {
        setSaveSuccess('Ticket updated successfully!');
        // Refresh modal data
        const updated = await api.requests.getById(selectedRequest.id);
        setSelectedRequest(updated.data);
        fetchData();
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update request.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-accepted" style={{ marginBottom: '0.4rem' }}>
            <Shield size={13} /> Technician Dispatch Center
          </span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Technician Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Welcome back, <strong>{user?.name || 'Marcus Vance'}</strong>. Monitor customer tickets, update status, and manage repairs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setActivePage('repairer-profile')}
            className="btn btn-secondary btn-sm"
            id="btn-dash-profile"
          >
            <User size={15} /> My Profile
          </button>
          <button
            onClick={fetchData}
            className="btn btn-secondary btn-sm"
            title="Refresh data"
            id="btn-dash-refresh"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Modern Dashboard Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h5>Total Requests</h5>
            <h3>{stats.totalRequests}</h3>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Layers size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h5>Pending</h5>
            <h3 style={{ color: '#d97706' }}>{stats.pendingRequests}</h3>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h5>In Progress</h5>
            <h3 style={{ color: '#4f46e5' }}>{stats.inProgressRequests}</h3>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Wrench size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h5>Completed</h5>
            <h3 style={{ color: '#16a34a' }}>{stats.completedRequests}</h3>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h5>Today's Requests</h5>
            <h3>{stats.todaysRequests}</h3>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f0fdfa', color: '#0d9488' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h5>Estimated Revenue</h5>
            <h3 style={{ color: '#059669' }}>{formatINR(stats.estimatedRevenue)}</h3>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h5>Avg Rating</h5>
            <h3 style={{ color: '#d97706' }}>{stats.averageRating} ★</h3>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Star size={24} fill="#d97706" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card card-padded" style={{ marginBottom: '1.75rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search ticket ID, problem, address, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.9rem' }}
                id="dash-search-input"
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" id="dash-search-btn">
              <Search size={15} /> Search
            </button>
          </form>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}
              id="dash-filter-category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tab Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {['all', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: statusFilter === st ? '#2563eb' : '#f1f5f9',
                color: statusFilter === st ? '#ffffff' : '#475569',
                border: 'none',
                transition: 'all 0.15s ease'
              }}
              id={`dash-filter-${st.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading repair requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="card card-padded" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No repair requests match current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="card card-padded"
              style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1.2fr', gap: '1.25rem', alignItems: 'center' }}
            >
              {/* Column 1: ID, Type & Urgency */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <strong style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem', color: '#0f172a' }}>
                    {req.id}
                  </strong>
                  <StatusBadge status={req.status} />
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb' }}>
                  {req.repair_type}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Urgency: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{req.urgency}</span>
                </div>
              </div>

              {/* Column 2: Problem & Customer Location */}
              <div>
                <p style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.35rem', lineHeight: 1.4 }}>
                  {req.problem}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} /> {req.address}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={13} /> {req.phone}
                  </span>
                </div>
              </div>

              {/* Column 3: Tech & Estimate */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Technician:</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  {req.repairer_name || 'Unassigned'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Estimated Cost:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: req.estimated_cost ? '#16a34a' : '#94a3b8' }}>
                  {formatINR(req.estimated_cost, { fallback: 'Not set' })}
                </div>
              </div>

              {/* Column 4: Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'flex-end' }}>
                <button
                  onClick={() => openRequestModal(req.id)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  id={`btn-manage-${req.id}`}
                >
                  Manage / Edit Details
                </button>

                {req.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                    <button
                      onClick={() => handleQuickAccept(req.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, borderColor: '#86efac', color: '#16a34a', background: '#f0fdf4' }}
                      title="Accept ticket"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleQuickCancel(req.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, borderColor: '#fca5a5', color: '#dc2626', background: '#fef2f2' }}
                      title="Decline ticket"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Request Detail & Management Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={closeModal}
        >
          <div
            className="card card-padded"
            style={{
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Manage Ticket
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
                  {selectedRequest.id}
                </h2>
              </div>
              <button
                onClick={closeModal}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                id="btn-close-modal"
              >
                <X size={18} />
              </button>
            </div>

            {saveSuccess && (
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                ✓ {saveSuccess}
              </div>
            )}
            {saveError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {saveError}
              </div>
            )}

            {/* Customer & Issue Summary */}
            <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedRequest.repair_type}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer Phone</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedRequest.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Service Location</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedRequest.address}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer Problem Description:</span>
                <p style={{ fontSize: '0.9rem', color: '#1e293b', margin: '0.2rem 0 0', lineHeight: 1.45 }}>
                  {selectedRequest.problem}
                </p>
              </div>

              {selectedRequest.image_url && (
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Customer Photo:</span>
                  <img
                    src={getMediaUrl(selectedRequest.image_url)}
                    alt="Problem attachment"
                    style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}
            </div>

            {/* Editable Management Form */}
            <form onSubmit={handleSaveChanges}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Status Progression *</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    id="modal-select-status"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 4500.00"
                    value={editForm.estimated_cost}
                    onChange={(e) => setEditForm({ ...editForm, estimated_cost: e.target.value })}
                    id="modal-input-cost"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Technician Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.repairer_name}
                    onChange={(e) => setEditForm({ ...editForm, repairer_name: e.target.value })}
                    id="modal-input-repairer-name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment Date & Window</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="date"
                      className="form-input"
                      value={editForm.preferred_date}
                      onChange={(e) => setEditForm({ ...editForm, preferred_date: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 14:00 - 16:00"
                      value={editForm.preferred_time}
                      onChange={(e) => setEditForm({ ...editForm, preferred_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Technician Repair & Diagnostic Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Record what was checked, parts replaced, or diagnostic tests completed..."
                  value={editForm.repair_notes}
                  onChange={(e) => setEditForm({ ...editForm, repair_notes: e.target.value })}
                  id="modal-textarea-notes"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Timeline Note (Appears on Customer Timeline)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Diagnostic complete. Waiting for replacement capacitor from warehouse."
                  value={editForm.status_note}
                  onChange={(e) => setEditForm({ ...editForm, status_note: e.target.value })}
                  id="modal-input-timeline-note"
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="btn-save-modal-changes"
                >
                  Save Changes to Ticket
                </button>
              </div>
            </form>

            {/* Timeline history inside modal */}
            {selectedRequest.timeline && selectedRequest.timeline.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Update History ({selectedRequest.timeline.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {selectedRequest.timeline.map((item, i) => (
                    <div key={i} style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <strong>{item.status}</strong>
                        <span style={{ color: '#94a3b8' }}>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                      <div style={{ color: '#334155' }}>{item.note}</div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>By: {item.created_by}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
