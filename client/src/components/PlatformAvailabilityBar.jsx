import React from 'react';
import { CheckCircle2, XCircle, Loader2, MapPin, RefreshCw } from 'lucide-react';

// Canonical display order + friendly names (mirrors ORDERED_PLATFORMS in ComparisonMatrix)
const PLATFORM_META = [
  { key: 'apollo',     label: 'Apollo',       color: '#d4163c' },
  { key: 'pharmeasy', label: 'PharmEasy',     color: '#5f2d91' },
  { key: 'onemg',     label: 'Tata 1mg',      color: '#e40046' },
  { key: 'netmeds',   label: 'Netmeds',        color: '#00a99d' },
  { key: 'truemeds',  label: 'Truemeds',       color: '#00b4c5' },
  { key: 'platinumrx',label: 'PlatinumRx',     color: '#7c3aed' },
  { key: 'zepto',     label: 'Zepto',          color: '#a855f7' },
  { key: 'amazon',    label: 'Amazon Rx',      color: '#f59e0b' },
];

export default function PlatformAvailabilityBar({ availability, loading, pincode, onRefresh }) {
  if (!loading && (!availability || Object.keys(availability).length === 0)) return null;

  const availableCount = Object.values(availability || {}).filter(p => p.available).length;
  const totalCount = Object.keys(availability || {}).length || PLATFORM_META.length;

  return (
    <div className="availability-bar" role="region" aria-label="Platform delivery availability">
      <div className="availability-bar-header">
        <div className="availability-bar-title">
          <MapPin size={14} color="#10b981" />
          <span>
            Delivery availability for PIN&nbsp;<strong>{pincode}</strong>
          </span>
          {!loading && (
            <span className="availability-summary">
              {availableCount}/{totalCount} platforms delivering
            </span>
          )}
        </div>
        {onRefresh && !loading && (
          <button
            className="availability-refresh-btn"
            onClick={onRefresh}
            title="Re-check availability"
            aria-label="Refresh availability"
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      <div className="availability-pills">
        {PLATFORM_META.map(({ key, label, color }) => {
          if (loading) {
            return (
              <div key={key} className="avail-pill avail-loading" aria-hidden="true">
                <Loader2 size={12} className="spin-icon" />
                <span>{label}</span>
              </div>
            );
          }

          const info = availability?.[key];
          if (!info) return null;
          const isAvail = info.available;

          return (
            <div
              key={key}
              className={`avail-pill ${isAvail ? 'avail-green' : 'avail-red'}`}
              title={isAvail ? `${label} delivers to ${pincode}` : `${label} does not deliver to ${pincode}`}
              style={isAvail ? { '--platform-color': color } : undefined}
            >
              {isAvail ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
