import React, { useState } from 'react';
import { X, Search, MapPin, Sparkles, TrendingDown, Zap, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

const SAMPLE_SEARCHES = [
  { label: 'Telma 40', tag: 'Blood Pressure', icon: '🩺' },
  { label: 'Glycomet GP 2', tag: 'Diabetes', icon: '🩸' },
  { label: 'Pan 40', tag: 'Acidity / GERD', icon: '💊' },
  { label: 'Dolo 650', tag: 'Fever & Pain', icon: '🤒' }
];

export default function WelcomeGuideModal({ isOpen, onClose, onSelectSample }) {
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    onClose(doNotShowAgain);
  };

  const handleSampleClick = (medicine) => {
    if (onSelectSample) {
      onSelectSample(medicine);
    }
    onClose(doNotShowAgain);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="modal-card welcome-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="welcome-modal-header">
          <div className="welcome-header-badge">
            <Sparkles size={14} />
            <span>Welcome to MedCompare India</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close welcome guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="welcome-modal-body">
          {/* Hero Pitch */}
          <div className="welcome-hero-banner">
            <h2>Stop overpaying for your family's medicines.</h2>
            <p>
              Different e-pharmacies charge completely different prices for the exact same medicine.
              MedCompare compares <strong>8 leading platforms</strong> (Apollo, PharmEasy, Tata 1mg, Netmeds, Truemeds, PlatinumRx, Zepto, Amazon) in real-time so you never overpay.
            </p>
          </div>

          {/* 3 Step Guide */}
          <div className="welcome-section-title">
            <span>How to Use MedCompare in 3 Easy Steps</span>
          </div>

          <div className="welcome-steps-grid">
            <div className="welcome-step-card">
              <div className="step-number-bubble">1</div>
              <div className="step-icon-wrap search-step">
                <Search size={18} />
              </div>
              <h4>Search Any Brand</h4>
              <p>
                No need to know complex chemical salts. Type your prescribed brand name (like <em>Dolo 650</em> or <em>Telma 40</em>), pick a category bubble, or snap a photo of your strip.
              </p>
            </div>

            <div className="welcome-step-card">
              <div className="step-number-bubble">2</div>
              <div className="step-icon-wrap pin-step">
                <MapPin size={18} />
              </div>
              <h4>Check Delivery Time</h4>
              <p>
                Enter your PIN code to see real-time store availability — from <strong>10-minute instant delivery (Zepto)</strong> to standard 24-hr pharmacy delivery.
              </p>
            </div>

            <div className="welcome-step-card">
              <div className="step-number-bubble">3</div>
              <div className="step-icon-wrap save-step">
                <TrendingDown size={18} />
              </div>
              <h4>Compare & Save Generics</h4>
              <p>
                Compare true cost per tablet (₹/tab) across stores and discover certified bio-equivalent generics that save <strong>up to 70%+ (₹3,000–₹8,000/year)</strong>.
              </p>
            </div>
          </div>

          {/* Key Value Highlights */}
          <div className="welcome-benefits-row">
            <div className="benefit-pill">
              <Zap size={14} color="#f59e0b" />
              <span><strong>10-Min Fast Delivery:</strong> Zepto & Apollo instant delivery</span>
            </div>
            <div className="benefit-pill">
              <ShieldCheck size={14} color="#10b981" />
              <span><strong>100% CDSCO Bio-Equivalent:</strong> Safe, certified generic salts</span>
            </div>
            <div className="benefit-pill">
              <CheckCircle2 size={14} color="#3b82f6" />
              <span><strong>Zero Markups:</strong> Completely free & independent aggregator</span>
            </div>
          </div>

          {/* 1-Tap Sample Searches */}
          <div className="welcome-samples-container">
            <span className="samples-heading">Try a 1-Tap Sample Search Right Now:</span>
            <div className="welcome-samples-grid">
              {SAMPLE_SEARCHES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className="welcome-sample-btn"
                  onClick={() => handleSampleClick(s.label)}
                >
                  <span className="sample-icon">{s.icon}</span>
                  <div className="sample-text-wrap">
                    <span className="sample-name">{s.label}</span>
                    <span className="sample-tag">{s.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Checkbox & CTA */}
        <div className="welcome-modal-footer">
          <label className="do-not-show-label">
            <input
              type="checkbox"
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
              id="dont-show-onboarding-checkbox"
            />
            <span>Do not show this further</span>
          </label>

          <button
            type="button"
            className="welcome-cta-btn"
            onClick={handleClose}
            id="start-comparing-btn"
          >
            <span>Start Comparing</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
