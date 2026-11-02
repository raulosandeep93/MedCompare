import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingDown,
  Zap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Store,
  FlaskConical,
  Award,
  Calculator,
  Eye
} from 'lucide-react';

const SLIDES = [
  {
    id: 'compare',
    stepNumber: '1',
    tabLabel: 'Store Price Comparison',
    badgeText: 'Live Price Comparison',
    badgeColor: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.12)',
    title: 'Compare 8 Major Indian Pharmacies in Real-Time',
    subtitle:
      'Different apps charge wildly different prices for the exact same drug. MedCompare scans all 8 stores simultaneously so you never overpay.',
    takeaways: [
      'Normalized ₹/tablet and ₹/ml rates — no tricks from different pack sizes.',
      'Check real delivery speeds: 10-minute Zepto instant delivery vs 24h standard pharmacy.',
      'Unbiased 1-click links to buy directly from the store offering the best price.'
    ],
    previewType: 'store_matrix'
  },
  {
    id: 'generics',
    stepNumber: '2',
    tabLabel: 'Generic 70% Savings',
    badgeText: 'Smart Generic Alternatives',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    title: 'Discover 100% Bio-Equivalent Generics (Save ₹3,000–₹8,000/yr)',
    subtitle:
      'Why pay high brand markups? Switching to government-certified generics gives you the exact same chemical formulation at a fraction of the cost.',
    takeaways: [
      '100% CDSCO and WHO-GMP certified identical active salts.',
      'Interactive Annual Refill Calculator: calculate true annual family savings for chronic doses.',
      'Side-by-side comparison of branded cost vs generic bio-equivalent.'
    ],
    previewType: 'generics_calculator'
  },
  {
    id: 'safety',
    stepNumber: '3',
    tabLabel: 'Uses & Safety Guide',
    badgeText: 'Clinical Guidance',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    title: 'Understand Active Salts, Uses & Clinical Precautions',
    subtitle:
      'Medical literacy made simple. Always know what chemicals you are consuming, why the medicine was prescribed, and how to store it safely.',
    takeaways: [
      'Identifies the exact active chemical salt and therapeutic strength.',
      'Verified medical indications, common side effects, and usage precautions.',
      'Easy search by either prescribed brand name or generic chemical salt.'
    ],
    previewType: 'safety_guide'
  }
];

const SAMPLE_SEARCHES = [
  { label: 'Telma 40', tag: 'Blood Pressure', icon: '🩺' },
  { label: 'Glycomet GP 2', tag: 'Diabetes', icon: '🩸' },
  { label: 'Pan 40', tag: 'Acidity / GERD', icon: '💊' },
  { label: 'Dolo 650', tag: 'Fever & Pain', icon: '🤒' }
];

export default function WelcomeGuideModal({ isOpen, onClose, onSelectSample }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  if (!isOpen) return null;

  const currentSlide = SLIDES[currentSlideIndex];

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    onClose(doNotShowAgain);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
  };

  const handleSampleClick = (medicine) => {
    if (onSelectSample) {
      onSelectSample(medicine);
    }
    onClose(doNotShowAgain);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-card welcome-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="welcome-modal-header">
          <div className="welcome-header-badge">
            <Sparkles size={14} />
            <span>Interactive Guide: How MedCompare Works</span>
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
          {/* 3 Step Interactive Navigation Bar */}
          <div className="tour-stepper-nav" role="tablist" aria-label="Feature walkthrough steps">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`tour-step-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentSlideIndex(idx)}
                >
                  <span className="step-circle">{slide.stepNumber}</span>
                  <span className="step-tab-text">{slide.tabLabel}</span>
                  {isActive && <div className="step-tab-line" />}
                </button>
              );
            })}
          </div>

          {/* Active Slide Content Card */}
          <div className="tour-slide-card">
            <div className="tour-slide-header">
              <span
                className="tour-slide-badge"
                style={{
                  color: currentSlide.badgeColor,
                  background: currentSlide.badgeBg,
                  borderColor: currentSlide.badgeColor
                }}
              >
                Step {currentSlide.stepNumber}: {currentSlide.badgeText}
              </span>
              <div className="tour-step-counter">
                {currentSlideIndex + 1} of {SLIDES.length}
              </div>
            </div>

            <h3 className="tour-slide-title">{currentSlide.title}</h3>
            <p className="tour-slide-desc">{currentSlide.subtitle}</p>

            {/* Interactive Visual Mockup / Simulation Area */}
            <div className="tour-mockup-container">
              {currentSlide.previewType === 'store_matrix' && (
                <div className="tour-mockup-stores">
                  <div className="mockup-header-bar">
                    <span className="mockup-med-title">Prescription: <strong>Dolo 650 (15 Tablets)</strong></span>
                    <span className="mockup-live-tag">● Live Price Check</span>
                  </div>
                  <div className="mockup-stores-grid">
                    <div className="mockup-store-card best-price">
                      <div className="mockup-store-top">
                        <span className="store-name">Apollo Pharmacy</span>
                        <span className="store-badge green">Lowest Price</span>
                      </div>
                      <div className="store-price">₹32.50 <span className="unit">₹2.17/tab</span></div>
                      <div className="store-sla">Delivery: <strong>2 Hours</strong></div>
                    </div>

                    <div className="mockup-store-card fast-sla">
                      <div className="mockup-store-top">
                        <span className="store-name">Zepto</span>
                        <span className="store-badge amber">⚡ 10-Min Fast</span>
                      </div>
                      <div className="store-price">₹34.00 <span className="unit">₹2.26/tab</span></div>
                      <div className="store-sla">Delivery: <strong>10-20 Mins</strong></div>
                    </div>

                    <div className="mockup-store-card">
                      <div className="mockup-store-top">
                        <span className="store-name">Tata 1mg</span>
                        <span className="store-badge blue">15% Off</span>
                      </div>
                      <div className="store-price">₹35.20 <span className="unit">₹2.34/tab</span></div>
                      <div className="store-sla">Delivery: <strong>Tomorrow</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide.previewType === 'generics_calculator' && (
                <div className="tour-mockup-generics">
                  <div className="mockup-header-bar">
                    <span className="mockup-med-title">Prescription: <strong>Telma 40 (Telmisartan 40mg)</strong></span>
                    <span className="mockup-live-tag green">● Bio-Equivalent Verified</span>
                  </div>
                  <div className="mockup-calc-box">
                    <div className="calc-comparison-row">
                      <div className="calc-side brand">
                        <span className="calc-label">Prescribed Brand (Telma 40)</span>
                        <span className="calc-amount strike">₹145 / pack</span>
                        <span className="calc-annual">₹1,740 / year</span>
                      </div>
                      <div className="calc-divider">
                        <span className="vs-circle">VS</span>
                      </div>
                      <div className="calc-side generic">
                        <span className="calc-label">Generic Equivalent (Telmisartan)</span>
                        <span className="calc-amount save">₹38 / pack</span>
                        <span className="calc-annual save">₹456 / year</span>
                      </div>
                    </div>
                    <div className="calc-bottom-highlight">
                      <Sparkles size={16} color="#10b981" />
                      <span>Net Family Savings: <strong>₹1,284 every year (74% saved!)</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide.previewType === 'safety_guide' && (
                <div className="tour-mockup-safety">
                  <div className="mockup-header-bar">
                    <span className="mockup-med-title">Chemical Breakdown: <strong>Augmentin 625 Duo</strong></span>
                    <span className="mockup-live-tag purple">● CDSCO Clinical Data</span>
                  </div>
                  <div className="mockup-safety-grid">
                    <div className="safety-block">
                      <span className="safety-label">Active Chemical Formulation:</span>
                      <p className="safety-val">Amoxicillin (500mg) + Clavulanic Acid (125mg)</p>
                    </div>
                    <div className="safety-block">
                      <span className="safety-label">Primary Indications:</span>
                      <p className="safety-val">Bacterial infections of respiratory tract, lungs, and skin.</p>
                    </div>
                    <div className="safety-block full">
                      <span className="safety-label">Doctor's Precaution:</span>
                      <p className="safety-val">Complete the full antibiotic cycle. Take with food to prevent gastric discomfort.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Key Takeaways Checklist */}
            <div className="tour-takeaways-list">
              {currentSlide.takeaways.map((point, i) => (
                <div key={i} className="tour-takeaway-item">
                  <CheckCircle2 size={15} color={currentSlide.badgeColor} />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="tour-stepper-controls">
              <button
                type="button"
                className="tour-nav-btn prev"
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>

              {/* Progress Dots */}
              <div className="tour-dots">
                {SLIDES.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    className={`tour-dot ${dotIdx === currentSlideIndex ? 'active' : ''}`}
                    onClick={() => setCurrentSlideIndex(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="tour-nav-btn next"
                onClick={handleNext}
              >
                <span>{currentSlideIndex === SLIDES.length - 1 ? 'Back to Start' : 'Next Step'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* 1-Tap Sample Search Live Test */}
          <div className="welcome-samples-container">
            <span className="samples-heading">Try it live now — tap any sample medicine:</span>
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
            <span>Do not show this tour on next visit</span>
          </label>

          <button
            type="button"
            className="welcome-cta-btn"
            onClick={handleClose}
            id="start-comparing-btn"
          >
            <span>Start Comparing Medicines</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
