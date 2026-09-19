import React from 'react';
import { Search, Camera, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SearchSection({
  query,
  setQuery,
  onSearch,
  onOpenScanner,
  loading,
  popularMedicines,
  activeMedicine
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-badge">
        <Sparkles size={14} /> Live Comparison across 8 Major Pharmacy Platforms
      </div>

      <h1 className="hero-title">
        Never Overpay for <span>Medicines</span> in India
      </h1>

      <p className="hero-subtitle">
        Real-time price comparison across leading e-pharmacies. Compare pack sizes, per-tablet costs, delivery speeds, and verified generic substitutes.
      </p>

      {/* Search Input Container */}
      <div className="search-wrapper">
        <form onSubmit={handleSubmit} className="search-box-card">
          <Search size={20} color="var(--text-muted)" style={{ marginLeft: '0.5rem' }} />

          <input
            type="text"
            className="search-input-field"
            placeholder="Search medicine name or salt (e.g. Dolo 650, Telma 40, Augmentin 625)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="medicine-search-input"
          />

          <button
            type="button"
            className="scanner-cta-btn"
            onClick={onOpenScanner}
            title="Upload photo of your medicine strip or packaging"
            id="open-strip-scanner-btn"
          >
            <Camera size={16} color="#10b981" />
            <span>Scan Strip</span>
          </button>

          <button
            type="submit"
            className="search-submit-btn"
            disabled={loading}
            id="execute-search-btn"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                <span>Comparing...</span>
              </>
            ) : (
              <span>Compare</span>
            )}
          </button>
        </form>

        {/* Quick Medicine Suggestion Chips */}
        <div className="quick-chips-wrap">
          <span className="chips-label">Popular Searches:</span>
          {popularMedicines.map((med) => {
            const isActive = activeMedicine?.toLowerCase() === med.name.toLowerCase();
            return (
              <button
                key={med.name}
                className={`chip-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setQuery(med.name);
                  onSearch(med.name);
                }}
              >
                {med.name}
              </button>
            );
          })}
        </div>

        {/* Live Platform Connectivity Status */}
        <div className="platform-status-bar">
          <span style={{ fontWeight: 600 }}>8 Live Stores:</span>
          <span className="platform-pill">
            <span className="status-dot" /> Apollo (2-Hr Express)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> PharmEasy (Guaranteed)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Tata 1mg
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Netmeds
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Truemeds (Generics)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> PlatinumRx
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Zepto (10-Min)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Amazon Pharmacy
          </span>
        </div>
      </div>
    </section>
  );
}
