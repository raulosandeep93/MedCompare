import React, { useState } from 'react';
import { X, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { lookupPincode } from '../utils/api';

const POPULAR_PRESETS = [
  { pin: '560001', city: 'Bengaluru', state: 'Karnataka' },
  { pin: '110001', city: 'New Delhi', state: 'Delhi' },
  { pin: '400001', city: 'Mumbai', state: 'Maharashtra' },
  { pin: '500001', city: 'Hyderabad', state: 'Telangana' },
  { pin: '600001', city: 'Chennai', state: 'Tamil Nadu' },
  { pin: '700001', city: 'Kolkata', state: 'West Bengal' },
  { pin: '411001', city: 'Pune', state: 'Maharashtra' },
  { pin: '380001', city: 'Ahmedabad', state: 'Gujarat' }
];

export default function PincodeModal({ isOpen, onClose, currentPincode, onSelectPincode }) {
  const [inputPin, setInputPin] = useState(currentPincode || '560001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApply = async (pinToUse) => {
    const pin = (pinToUse || inputPin).trim();
    if (!/^\d{6}$/.test(pin)) {
      setError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await lookupPincode(pin);
      if (data.valid) {
        onSelectPincode(pin, data.city, data);
        onClose();
      } else {
        setError(data.message || 'Pincode not found');
      }
    } catch {
      onSelectPincode(pin, 'India', null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="#10b981" />
            <h3>Select Delivery Location</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Medicine delivery timelines and store availability vary by pincode across Apollo, Truemeds, and PlatinumRx.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="text"
              className="search-input-field"
              style={{
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.65rem 1rem',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}
              placeholder="Enter 6-digit PIN code (e.g. 560001)"
              value={inputPin}
              maxLength={6}
              onChange={(e) => {
                setInputPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
            <button
              className="search-submit-btn"
              onClick={() => handleApply()}
              disabled={loading}
              style={{ minWidth: '100px', justifyContent: 'center' }}
            >
              {loading ? 'Checking...' : 'Apply'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem', fontWeight: 500 }}>
              {error}
            </p>
          )}

          <div style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.65rem' }}>
              Popular Indian Hubs:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {POPULAR_PRESETS.map((p) => (
                <button
                  key={p.pin}
                  className="sample-strip-btn"
                  onClick={() => {
                    setInputPin(p.pin);
                    handleApply(p.pin);
                  }}
                  style={{
                    border: currentPincode === p.pin ? '1px solid #10b981' : undefined,
                    background: currentPincode === p.pin ? 'rgba(16, 185, 129, 0.08)' : undefined
                  }}
                >
                  <span>{p.city}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.pin}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
