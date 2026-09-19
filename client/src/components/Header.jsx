import React from 'react';
import { Pill, MapPin, Moon, Sun } from 'lucide-react';

export default function Header({ pincode, city, onOpenPincode, theme, onToggleTheme }) {
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
