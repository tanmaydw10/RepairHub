import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Wrench,
  AlertCircle,
  ExternalLink,
  Plus,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { formatINR } from '../utils/formatters';

export default function CustomerProfilePage({ setActivePage, setTrackingIdInput }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    async function fetchCustomerRequests() {
      setLoading(true);
      try {
        const res = await api.requests.list({ customer_id: user?.id || 1 });
        if (res.success && res.data) {
          setRequests(res.data);
        }
      } catch (err) {
        console.warn('Error fetching customer requests:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerRequests();
  }, [user]);

  const activeRepairs = requests.filter(r => ['Pending', 'Accepted', 'In Progress'].includes(r.status));
  const completedRepairs = requests.filter(r => r.status === 'Completed');

  const displayedRequests = activeTab === 'active'
    ? activeRepairs
    : activeTab === 'completed'
    ? completedRepairs
    : requests;

  const handleTrackClick = (id) => {
    if (setTrackingIdInput) setTrackingIdInput(id);
    setActivePage('track');
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '2.5rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Profile Header Box */}
      <div className="card card-padded" style={{ marginBottom: '2.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #0284c7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {user?.name || 'Alex Johnson'}
                </h1>
                <span className="badge badge-accepted" style={{ textTransform: 'capitalize' }}>
                  {user?.role || 'Customer'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} /> {user?.email || 'customer@repairhub.local'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} /> {user?.phone || '+1 (555) 234-5678'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> {user?.address || '452 Campus Drive, Apt 3B'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('request')}
            className="btn btn-primary"
            id="btn-customer-new-repair"
          >
            <Plus size={16} /> Book New Repair
          </button>
        </div>

        {/* Quick summary stat counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Requests</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{requests.length}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: 700 }}>Active Repairs</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{activeRepairs.length}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#16a34a', textTransform: 'uppercase', fontWeight: 700 }}>Completed Repairs</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{completedRepairs.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            color: activeTab === 'all' ? '#2563eb' : '#64748b',
            background: activeTab === 'all' ? '#eff6ff' : 'transparent'
          }}
          id="tab-all-repairs"
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            color: activeTab === 'active' ? '#2563eb' : '#64748b',
            background: activeTab === 'active' ? '#eff6ff' : 'transparent'
          }}
          id="tab-active-repairs"
        >
          Current / Active Repairs ({activeRepairs.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            color: activeTab === 'completed' ? '#16a34a' : '#64748b',
            background: activeTab === 'completed' ? '#f0fdf4' : 'transparent'
          }}
          id="tab-completed-repairs"
        >
          Completed Repairs ({completedRepairs.length})
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading your repair history...
        </div>
      ) : displayedRequests.length === 0 ? (
        <div className="card card-padded" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>No requests in this view.</p>
          <button onClick={() => setActivePage('request')} className="btn btn-secondary">
            Book a repair now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayedRequests.map((req) => (
            <div key={req.id} className="card card-padded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <strong style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: '#0f172a' }}>
                    {req.id}
                  </strong>
                  <span className="badge badge-accepted">{req.repair_type}</span>
                  <StatusBadge status={req.status} />
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 0.5rem 0' }}>
                  {req.problem}
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                  <span>Specialist: {req.repairer_name || 'Pending assignment'}</span>
                  {req.estimated_cost && <span style={{ color: '#16a34a', fontWeight: 700 }}>Est: {formatINR(req.estimated_cost)}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleTrackClick(req.id)}
                  className="btn btn-secondary btn-sm"
                  id={`btn-track-${req.id}`}
                >
                  <ExternalLink size={14} /> Track Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
