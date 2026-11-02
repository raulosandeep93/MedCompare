import React, { useState, useEffect } from 'react';
import { Pill, MapPin, Moon, Sun, AlertCircle, Lightbulb, History, HelpCircle, Menu, X, ChevronRight } from 'lucide-react';

export default function Header({
  pincode,
  city,
  locationStatus = 'idle',
  onOpenPincode,
  onOpenReportIssue,
  onOpenSuggestFeature,
  onOpenChangelogs,
  onOpenWelcomeGuide,
  theme,
  onToggleTheme
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const closeAndRun = (fn) => {
    setMobileMenuOpen(false);
    setTimeout(fn, 150);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          {/* Logo */}
          <div className="logo-group">
            <div className="logo-icon-wrap">
              <Pill size={22} />
            </div>
            <div className="logo-text">
              <h1>MedCompare</h1>
              <span>India's Multi-Pharmacy Price Aggregator</span>
            </div>
          </div>

          <div className="header-actions">
            {/* 1. Location / PIN Code */}
            <button
              className={`pincode-pill ${locationStatus === 'detecting' ? 'detecting' : ''}`}
              onClick={onOpenPincode}
              title={locationStatus === 'detecting' ? 'Auto-detecting delivery location...' : 'Delivery Location (Click to change)'}
              id="pincode-trigger-btn"
            >
              <MapPin size={14} color="#10b981" className={locationStatus === 'detecting' ? 'location-pulse-icon' : ''} />
              {locationStatus === 'detecting' ? (
                <span>Locating...</span>
              ) : (
                <>
                  <span>{pincode}</span>
                  {city && <span style={{ color: 'var(--text-muted)' }}>• {city}</span>}
                </>
              )}
            </button>

            {/* Desktop nav buttons */}
            <button
              className="header-nav-btn report"
              onClick={onOpenReportIssue}
              title="Report price difference, missing medicine, or broken link"
              id="report-issue-btn"
            >
              <AlertCircle size={14} color="#f59e0b" />
              <span>Report</span>
            </button>

            <button
              className="header-nav-btn suggest"
              onClick={onOpenSuggestFeature}
              title="Suggest a new feature or vote on community ideas"
              id="suggest-feature-btn"
            >
              <Lightbulb size={14} color="#3b82f6" />
              <span>Suggest</span>
            </button>

            <button
              className="header-nav-btn guide"
              onClick={onOpenWelcomeGuide}
              title="Learn how MedCompare works and how to save"
              id="how-it-works-btn"
            >
              <HelpCircle size={14} color="#10b981" />
              <span>How it works</span>
            </button>

            <button
              className="header-nav-btn changelog"
              onClick={onOpenChangelogs}
              title="View product release history and new features"
              id="changelogs-btn"
            >
              <History size={14} color="#8b5cf6" />
              <span>Changelog</span>
            </button>

            {/* Theme Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* Mobile Hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              id="mobile-menu-open-btn"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="mobile-nav-drawer"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer handle */}
            <div className="drawer-handle-bar" />

            {/* Drawer header */}
            <div className="drawer-header">
              <div className="logo-group">
                <div className="logo-icon-wrap" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <Pill size={18} />
                </div>
                <div className="logo-text">
                  <h1 style={{ fontSize: '1.1rem' }}>MedCompare</h1>
                </div>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Location pill (large) */}
            <button
              className="drawer-location-row"
              onClick={() => closeAndRun(onOpenPincode)}
            >
              <div className="drawer-location-left">
                <MapPin size={18} color="#10b981" />
                <div>
                  <span className="drawer-location-label">Delivery to</span>
                  <span className="drawer-location-value">
                    {locationStatus === 'detecting' ? 'Detecting...' : `${pincode}${city ? ` · ${city}` : ''}`}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>

            {/* Nav items */}
            <div className="drawer-nav-list">
              <button
                className="drawer-nav-item"
                onClick={() => closeAndRun(onOpenWelcomeGuide)}
              >
                <div className="drawer-nav-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                  <HelpCircle size={18} />
                </div>
                <div className="drawer-nav-text">
                  <span className="drawer-nav-title">How It Works</span>
                  <span className="drawer-nav-desc">Learn how to save on medicines</span>
                </div>
                <ChevronRight size={15} color="var(--text-muted)" />
              </button>

              <button
                className="drawer-nav-item"
                onClick={() => closeAndRun(onOpenSuggestFeature)}
              >
                <div className="drawer-nav-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                  <Lightbulb size={18} />
                </div>
                <div className="drawer-nav-text">
                  <span className="drawer-nav-title">Suggest a Feature</span>
                  <span className="drawer-nav-desc">Vote on community ideas</span>
                </div>
                <ChevronRight size={15} color="var(--text-muted)" />
              </button>

              <button
                className="drawer-nav-item"
                onClick={() => closeAndRun(onOpenReportIssue)}
              >
                <div className="drawer-nav-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                  <AlertCircle size={18} />
                </div>
                <div className="drawer-nav-text">
                  <span className="drawer-nav-title">Report an Issue</span>
                  <span className="drawer-nav-desc">Wrong price or broken link</span>
                </div>
                <ChevronRight size={15} color="var(--text-muted)" />
              </button>

              <button
                className="drawer-nav-item"
                onClick={() => closeAndRun(onOpenChangelogs)}
              >
                <div className="drawer-nav-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                  <History size={18} />
                </div>
                <div className="drawer-nav-text">
                  <span className="drawer-nav-title">Changelog</span>
                  <span className="drawer-nav-desc">Recent updates & new features</span>
                </div>
                <ChevronRight size={15} color="var(--text-muted)" />
              </button>
            </div>

            {/* Theme Toggle in drawer */}
            <div className="drawer-footer">
              <button
                className="drawer-theme-toggle"
                onClick={() => { onToggleTheme(); }}
              >
                {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
                <span>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
