import React, { useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, TrendingDown, Calculator, Calendar, CheckCircle2, HeartHandshake } from 'lucide-react';

export default function SubstituteSection({ substitutes, brandItem, searchedMedicine: _searchedMedicine }) {
  // Daily dosage toggle for chronic refills: 1 tab/day or 2 tabs/day
  const [dailyDose, setDailyDose] = useState(1);

  if (!substitutes || substitutes.length === 0) {
    return null;
  }

  // Derive reference brand pricing
  const brandUnitPrice = brandItem?.unitPrice ? parseFloat(brandItem.unitPrice) : null;

  // Find best generic substitute (highest savings or lowest unit price)
  const topSubstitute = substitutes[0];
  const topGenericUnitPrice = topSubstitute?.unitPrice ? parseFloat(topSubstitute.unitPrice) : 0;

  // Calculate annual savings for chronic refill
  // If we have both brand and generic unit price, calculate exact rupee difference
  let unitDiff = 0;
  if (brandUnitPrice && topGenericUnitPrice && brandUnitPrice > topGenericUnitPrice) {
    unitDiff = brandUnitPrice - topGenericUnitPrice;
  } else if (topSubstitute?.savingsVsBrand || topSubstitute?.discountPercent) {
    const pct = (topSubstitute.savingsVsBrand || topSubstitute.discountPercent) / 100;
    // Estimate baseline if brand unit price isn't directly parsed
    const estimatedBrandUnit = topGenericUnitPrice > 0 ? (topGenericUnitPrice / (1 - pct)) : 10;
    unitDiff = Math.max(0, estimatedBrandUnit - topGenericUnitPrice);
  }

  const pillsPerYear = dailyDose * 365;

  const estimatedBrandYearly = brandUnitPrice
    ? Math.round(brandUnitPrice * pillsPerYear)
    : Math.round((topGenericUnitPrice + unitDiff) * pillsPerYear);

  const estimatedGenericYearly = Math.round(topGenericUnitPrice * pillsPerYear);
  const annualSavings = Math.max(0, estimatedBrandYearly - estimatedGenericYearly);
  const monthlySavings = Math.round(annualSavings / 12);
  const overallSavingsPercent = estimatedBrandYearly > 0
    ? Math.round((annualSavings / estimatedBrandYearly) * 100)
    : (topSubstitute?.savingsVsBrand || 65);

  return (
    <div className="substitutes-section" id="generic-substitutes-section">
      {/* Header */}
      <div className="substitutes-header">
        <div className="substitutes-title-group">
          <div className="substitutes-icon-wrap">
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                Generic & Bio-Equivalent Substitutes
              </h3>
              <span className="substitutes-pill-tag">
                Save up to {overallSavingsPercent}%
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Identical active pharmaceutical molecule (same strength & formulation) at a fraction of branded cost
            </p>
          </div>
        </div>

        <div className="bio-equivalent-badge">
          <ShieldCheck size={16} /> 100% CDSCO Bio-Equivalent
        </div>
      </div>

      {/* ── Chronic Condition Annual Savings Calculator ── */}
      <div className="chronic-calc-card">
        <div className="chronic-calc-header">
          <div className="chronic-calc-title">
            <Calculator size={18} color="#10b981" />
            <span>Chronic Condition Refill Savings Calculator</span>
          </div>
          <span className="chronic-calc-subtitle">
            Ideal for daily BP, Diabetes, Thyroid, Cholesterol, or Acidity medicines
          </span>
        </div>

        <div className="chronic-calc-body">
          <div className="dosage-selector-wrap">
            <span className="dosage-label">
              <Calendar size={14} /> Prescribed Daily Dosage:
            </span>
            <div className="dosage-toggle-group">
              <button
                type="button"
                className={`dosage-btn ${dailyDose === 1 ? 'active' : ''}`}
                onClick={() => setDailyDose(1)}
              >
                1 Tablet / Day (30 / mo)
              </button>
              <button
                type="button"
                className={`dosage-btn ${dailyDose === 2 ? 'active' : ''}`}
                onClick={() => setDailyDose(2)}
              >
                2 Tablets / Day (60 / mo)
              </button>
            </div>
          </div>

          <div className="chronic-savings-metrics">
            <div className="calc-metric-box branded">
              <span className="metric-box-label">Branded Annual Cost</span>
              <span className="metric-box-sub">Based on ~₹{brandUnitPrice ? brandUnitPrice.toFixed(2) : (topGenericUnitPrice + unitDiff).toFixed(2)}/tablet</span>
              <span className="metric-box-value strike">
                ₹{estimatedBrandYearly.toLocaleString('en-IN')}
                <span className="metric-box-freq">/yr</span>
              </span>
            </div>

            <div className="calc-metric-box generic">
              <span className="metric-box-label">Certified Generic Cost</span>
              <span className="metric-box-sub">via {topSubstitute.recommendedBy || topSubstitute.platformName} (~₹{topGenericUnitPrice.toFixed(2)}/tab)</span>
              <span className="metric-box-value safe">
                ₹{estimatedGenericYearly.toLocaleString('en-IN')}
                <span className="metric-box-freq">/yr</span>
              </span>
            </div>

            <div className="calc-metric-box savings highlight-pulse">
              <span className="metric-box-label">Your Annual Family Savings</span>
              <span className="metric-box-sub">~₹{monthlySavings.toLocaleString('en-IN')}/month in your pocket</span>
              <span className="metric-box-value win">
                ₹{annualSavings.toLocaleString('en-IN')}
                <span className="metric-box-freq">/year saved</span>
              </span>
            </div>
          </div>

          {/* Educational Trust Reassurance */}
          <div className="generic-trust-notice">
            <div className="trust-item">
              <CheckCircle2 size={15} color="#10b981" />
              <span><strong>Same Active Molecule:</strong> Performs identically in the human body as prescribed by your doctor.</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={15} color="#10b981" />
              <span><strong>WHO-GMP Certified:</strong> Produced by top pharmaceutical facilities with strict quality checks.</span>
            </div>
            <div className="trust-item">
              <HeartHandshake size={15} color="#10b981" />
              <span><strong>Why so cheap?</strong> Zero celebrity endorsements or lavish doctor marketing — you pay only for the medicine.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Verified Substitutes */}
      <div className="substitutes-grid">
        {substitutes.map((sub, idx) => {
          const savings = sub.savingsVsBrand || sub.discountPercent || 50;
          const subUnit = parseFloat(sub.unitPrice) || 0;
          const cardUnitDiff = brandUnitPrice && brandUnitPrice > subUnit
            ? (brandUnitPrice - subUnit)
            : unitDiff;
          const cardAnnualSavings = Math.round(cardUnitDiff * pillsPerYear);

          return (
            <div key={sub.id || idx} className="substitute-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span className="savings-tag-badge">
                    <TrendingDown size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Save {savings}% vs Branded
                  </span>
                  <span className="substitute-platform-tag">
                    via {sub.recommendedBy || sub.platformName}
                  </span>
                </div>

                <h4 className="substitute-card-name">
                  {sub.name}
                </h4>

                <div className="substitute-card-mfg">
                  Mfg: <strong>{sub.manufacturer}</strong>
                </div>

                <div className="substitute-price-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Unit Price:
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                      ₹{sub.unitPrice}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        /{sub.unitType || 'tablet'}
                      </span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Pack of {sub.packSize} {sub.unitType || 'tablet'}s:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      ₹{sub.sellingPrice}
                    </span>
                  </div>
                </div>

                {/* Annual Savings Pill on Card */}
                {cardAnnualSavings > 0 && (
                  <div className="card-annual-savings-pill">
                    <span>💡 Saves <strong>₹{cardAnnualSavings.toLocaleString('en-IN')}/yr</strong> on {dailyDose} tab/day</span>
                  </div>
                )}
              </div>

              <a
                href={sub.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`buy-platform-btn ${sub.platform}`}
                style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', marginTop: '0.75rem' }}
              >
                <span>View Generic on {sub.recommendedBy || sub.platformName}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
