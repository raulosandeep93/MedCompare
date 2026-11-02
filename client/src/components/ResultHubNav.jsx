import React from 'react';
import {
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  CheckCircle2,
  ListFilter,
  MousePointerClick
} from 'lucide-react';

export default function ResultHubNav({ data, activeTab, onChangeTab }) {
  if (!data) return null;

  const winners = data.comparison || {};
  const hasGenerics = Array.isArray(data.genericSubstitutes) && data.genericSubstitutes.length > 0;
  const hasInfo = Boolean(data.medicineInfo);
  const bestGeneric = hasGenerics ? data.genericSubstitutes[0] : null;

  // Platform count
  const platformCount = Object.keys(data.platforms || {}).length || 8;
  const lowestPrice = winners.lowestUnitPrice?.sellingPrice || winners.highestDiscount?.sellingPrice;
  const fastestDelivery = winners.fastestDelivery?.deliveryEstimate || '10-25 mins';

  const getSectionTitle = () => {
    if (activeTab === 'all') return 'All Sections Stacked (Full Page View)';
    if (activeTab === 'generics') return 'Generic Bio-Equivalents & Annual Refill Calculator';
    if (activeTab === 'info') return 'Clinical Medicine Guide & Safety Warnings';
    return 'Store Price Comparison across 8 Platforms';
  };

  return (
    <div className="result-hub-container">
      {/* Top Bar with Context and View Toggle */}
      <div className="result-hub-header">
        <div className="result-hub-info">
          <span className="hub-badge">
            <CheckCircle2 size={13} /> Comparison Ready
          </span>
          <h2 className="hub-headline">
            Results for <span>"{data.query}"</span>
          </h2>
        </div>

        {/* View Mode Toggle (Tabs vs All Sections) */}
        <div className="hub-view-mode-toggle">
          <button
            type="button"
            className={`hub-toggle-btn ${activeTab !== 'all' ? 'active' : ''}`}
            onClick={() => onChangeTab('compare')}
            title="Focus on one section at a time"
          >
            <Layers size={14} />
            <span>Focused View</span>
          </button>
          <button
            type="button"
            className={`hub-toggle-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onChangeTab('all')}
            title="Show all sections stacked on one page"
          >
            <ListFilter size={14} />
            <span>Show All Sections</span>
          </button>
        </div>
      </div>

      {/* 3 Interactive Hub Cards with Clear Click Affordance */}
      <div className="result-hub-grid" role="tablist" aria-label="Medicine Results Navigation">
        {/* Card 1: Store Price Comparison */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'compare'}
          className={`hub-card compare-hub-card ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => onChangeTab('compare')}
          id="hub-tab-compare"
        >
          <div className="hub-card-header">
            <div className="hub-header-left">
              <span className="hub-tab-number">TAB 1</span>
              <div className="hub-icon-wrap compare-icon">
                <TrendingDown size={18} />
              </div>
            </div>
            <span className="hub-pill store-pill">
              {platformCount} Stores Compared
            </span>
          </div>

          <div className="hub-card-body">
            <h3 className="hub-card-title">Store Price Comparison</h3>
            <p className="hub-card-subtitle">
              Live prices & delivery speeds on Apollo, PharmEasy, Tata 1mg, Zepto & more.
            </p>

            <div className="hub-micro-stats">
              {lowestPrice ? (
                <div className="micro-stat-item">
                  <span className="stat-label">Lowest:</span>
                  <span className="stat-value price">₹{lowestPrice}</span>
                </div>
              ) : null}
              <div className="micro-stat-item">
                <span className="stat-label">Speed:</span>
                <span className="stat-value speed">
                  <Zap size={12} /> {fastestDelivery}
                </span>
              </div>
            </div>
          </div>

          <div className={`hub-card-footer ${activeTab === 'compare' ? 'active' : 'inactive'}`}>
            {activeTab === 'compare' ? (
              <div className="hub-active-indicator compare">
                <span className="pulse-dot"></span>
                <span>VIEWING THIS SECTION</span>
              </div>
            ) : (
              <div className="hub-switch-cta compare">
                <span>Switch to Prices</span>
                <ArrowRight size={13} className="arrow-icon" />
              </div>
            )}
          </div>
          {activeTab === 'compare' && <div className="hub-down-notch compare-notch" />}
        </button>

        {/* Card 2: Generic Alternatives & Savings */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'generics'}
          disabled={!hasGenerics}
          className={`hub-card generics-hub-card ${activeTab === 'generics' ? 'active' : ''} ${!hasGenerics ? 'disabled' : ''}`}
          onClick={() => hasGenerics && onChangeTab('generics')}
          id="hub-tab-generics"
        >
          <div className="hub-card-header">
            <div className="hub-header-left">
              <span className="hub-tab-number">TAB 2</span>
              <div className="hub-icon-wrap generics-icon">
                <Sparkles size={18} />
              </div>
            </div>
            {hasGenerics ? (
              <span className="hub-pill savings-pill">
                Save up to {bestGeneric?.savingsVsBrand || bestGeneric?.discountPercent || 70}%
              </span>
            ) : (
              <span className="hub-pill neutral-pill">Branded Only</span>
            )}
          </div>

          <div className="hub-card-body">
            <h3 className="hub-card-title">Generic Substitutes & Savings</h3>
            <p className="hub-card-subtitle">
              {hasGenerics
                ? `Compare certified bio-equivalents and calculate annual chronic savings.`
                : `No generic bio-equivalents currently listed for this composition.`}
            </p>

            {hasGenerics && (
              <div className="hub-micro-stats">
                <div className="micro-stat-item">
                  <span className="stat-label">From:</span>
                  <span className="stat-value savings">
                    ₹{bestGeneric.unitPrice}/{bestGeneric.unitType || 'tab'}
                  </span>
                </div>
                <div className="micro-stat-item">
                  <span className="stat-label">Options:</span>
                  <span className="stat-value">
                    {data.genericSubstitutes.length} available
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={`hub-card-footer ${activeTab === 'generics' ? 'active' : 'inactive'}`}>
            {!hasGenerics ? (
              <span className="status-text disabled-text">No generic alternatives</span>
            ) : activeTab === 'generics' ? (
              <div className="hub-active-indicator generics">
                <span className="pulse-dot"></span>
                <span>VIEWING THIS SECTION</span>
              </div>
            ) : (
              <div className="hub-switch-cta generics">
                <span>Switch to Generics</span>
                <ArrowRight size={13} className="arrow-icon" />
              </div>
            )}
          </div>
          {activeTab === 'generics' && <div className="hub-down-notch generics-notch" />}
        </button>

        {/* Card 3: Medicine Guide & Safety */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'info'}
          disabled={!hasInfo}
          className={`hub-card info-hub-card ${activeTab === 'info' ? 'active' : ''} ${!hasInfo ? 'disabled' : ''}`}
          onClick={() => hasInfo && onChangeTab('info')}
          id="hub-tab-info"
        >
          <div className="hub-card-header">
            <div className="hub-header-left">
              <span className="hub-tab-number">TAB 3</span>
              <div className="hub-icon-wrap info-icon">
                <ShieldCheck size={18} />
              </div>
            </div>
            <span className="hub-pill info-pill">
              Clinical & Safety Guide
            </span>
          </div>

          <div className="hub-card-body">
            <h3 className="hub-card-title">Uses, Dosage & Side Effects</h3>
            <p className="hub-card-subtitle">
              Verified CDSCO safety guidance, primary medical indications & precautions.
            </p>

            <div className="hub-micro-stats">
              <div className="micro-stat-item">
                <span className="stat-label">Salt:</span>
                <span className="stat-value truncate-salt" title={data.medicineInfo?.salt || data.query}>
                  {data.medicineInfo?.salt || data.query}
                </span>
              </div>
              <div className="micro-stat-item">
                <span className="stat-label">Category:</span>
                <span className="stat-value">
                  {data.medicineInfo?.primaryUse || 'General Medical Info'}
                </span>
              </div>
            </div>
          </div>

          <div className={`hub-card-footer ${activeTab === 'info' ? 'active' : 'inactive'}`}>
            {activeTab === 'info' ? (
              <div className="hub-active-indicator info">
                <span className="pulse-dot"></span>
                <span>VIEWING THIS SECTION</span>
              </div>
            ) : (
              <div className="hub-switch-cta info">
                <span>Switch to Guide</span>
                <ArrowRight size={13} className="arrow-icon" />
              </div>
            )}
          </div>
          {activeTab === 'info' && <div className="hub-down-notch info-notch" />}
        </button>
      </div>

      {/* Visual Connector Banner linking the Tabs directly to the Section below */}
      <div className="hub-visual-bridge">
        <div className="bridge-current-view">
          <span className="bridge-indicator-dot"></span>
          <span className="bridge-title">
            Active Section: <strong>{getSectionTitle()}</strong>
          </span>
        </div>
        <div className="bridge-hint-pill">
          <MousePointerClick size={13} color="#3b82f6" />
          <span>Click any tab card above to switch between Prices, Generics, and Safety</span>
        </div>
      </div>
    </div>
  );
}
