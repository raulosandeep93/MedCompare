import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Send, AlertTriangle } from 'lucide-react';

const ISSUE_CATEGORIES = [
  { id: 'price_mismatch', label: 'Price Mismatch / Incorrect MRP' },
  { id: 'broken_link', label: 'Broken Store Link / 404 Redirection' },
  { id: 'wrong_stock', label: 'Availability / Stock Status Discrepancy' },
  { id: 'missing_medicine', label: 'Missing Medicine or Formulation' },
  { id: 'ui_bug', label: 'Website Glitch or UI Bug' },
  { id: 'other', label: 'Other Feedback' }
];

const PLATFORMS = [
  'All Stores / General',
  'Apollo Pharmacy',
  'PharmEasy',
  'Tata 1mg',
  'Netmeds',
  'Truemeds',
  'PlatinumRx',
  'Zepto',
  'Amazon Pharmacy'
];

export default function ReportIssueModal({ isOpen, onClose, currentMedicine = '' }) {
  const [category, setCategory] = useState('price_mismatch');
  const [platform, setPlatform] = useState('All Stores / General');
  const [medicineName, setMedicineName] = useState(currentMedicine || '');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Simulate saving report
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleReset}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Report an Issue</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Help us keep medicine prices and platform links 100% accurate
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleReset} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Issue Reported!
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
              Thank you for helping improve MedCompare. Our team verifies price discrepancies and link reports regularly.
            </p>
            <button
              type="button"
              className="search-submit-btn"
              style={{ margin: '0 auto', padding: '0.65rem 1.5rem' }}
              onClick={handleReset}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem' }}>
            {/* Issue Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Issue Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="composition-text-input"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform & Medicine Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="composition-text-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Medicine Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dolo 650, Augmentin"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="composition-text-input"
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Describe what happened *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain the price difference, broken link, or issue you noticed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="composition-text-input"
                style={{ resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>

            {/* Optional Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Your Email (Optional, if you want updates)
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="composition-text-input"
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="add-salt-btn"
                onClick={handleReset}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="execute-composition-btn"
                disabled={!description.trim()}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <Send size={15} />
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
