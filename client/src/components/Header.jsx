import React from 'react';
import { Pill, MapPin, Moon, Sun, AlertCircle, Lightbulb, History } from 'lucide-react';

export default function Header({
  pincode,
  city,
  onOpenPincode,
  onOpenReportIssue,
  onOpenSuggestFeature,
  onOpenChangelogs,
  theme,
  onToggleTheme
}) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-group">
          <div className="logo-icon-wrap">
            <Pill size={24} />
          </div>
          <div className="logo-text">
            <h1>MedCompare</h1>
            <span>India's Multi-Pharmacy Price Aggregator</span>
          </div>
        </div>

        <div className="header-actions">
          {/* 1. Location / PIN Code */}
          <button
            className="pincode-pill"
            onClick={onOpenPincode}
            title="Change Delivery PIN Code"
            id="pincode-trigger-btn"
          >
            <MapPin size={15} color="#10b981" />
            <span>{pincode}</span>
            {city && <span style={{ color: 'var(--text-muted)' }}>• {city}</span>}
          </button>

          {/* 2. Report Issues */}
          <button
            className="header-nav-btn report"
            onClick={onOpenReportIssue}
            title="Report price difference, missing medicine, or broken link"
            id="report-issue-btn"
          >
            <AlertCircle size={15} color="#f59e0b" />
            <span>Report issues</span>
          </button>

          {/* 3. Suggest Features */}
          <button
            className="header-nav-btn suggest"
            onClick={onOpenSuggestFeature}
            title="Suggest a new feature or vote on community ideas"
            id="suggest-feature-btn"
          >
            <Lightbulb size={15} color="#3b82f6" />
            <span>Suggest features</span>
          </button>

          {/* 4. Changelogs */}
          <button
            className="header-nav-btn changelog"
            onClick={onOpenChangelogs}
            title="View product release history and new features"
            id="changelogs-btn"
          >
            <History size={15} color="#8b5cf6" />
            <span>Changelogs</span>
          </button>

          {/* 5. Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
