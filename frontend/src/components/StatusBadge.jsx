import React from 'react';
import { Clock, CheckCircle, Wrench, XCircle, CheckCircle2 } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  const normalized = (status || 'Pending').toLowerCase();

  switch (normalized) {
    case 'pending':
      return (
        <span className={`badge badge-pending ${className}`}>
          <Clock size={13} /> Pending
        </span>
      );
    case 'accepted':
      return (
        <span className={`badge badge-accepted ${className}`}>
          <CheckCircle2 size={13} /> Accepted
        </span>
      );
    case 'in progress':
      return (
        <span className={`badge badge-in-progress ${className}`}>
          <Wrench size={13} /> In Progress
        </span>
      );
    case 'completed':
      return (
        <span className={`badge badge-completed ${className}`}>
          <CheckCircle size={13} /> Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className={`badge badge-cancelled ${className}`}>
          <XCircle size={13} /> Cancelled
        </span>
      );
    default:
      return (
        <span className={`badge badge-role ${className}`}>
          {status}
        </span>
      );
  }
}
