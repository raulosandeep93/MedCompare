import React from 'react';
import { Sparkles, ExternalLink, ShieldCheck, TrendingDown } from 'lucide-react';

export default function SubstituteSection({ substitutes }) {
  if (!substitutes || substitutes.length === 0) {
    return null;
  }

  return (
    <div className="substitutes-section">
      <div className="substitutes-header">
        <div className="substitutes-title-group">
          <div className="substitutes-icon-wrap">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Generic & Salt Substitute Alternatives
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Identical active chemical molecule with CDSCO-approved bioequivalence at 50% to 80% lower cost
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#059669', fontWeight: 600 }}>
          <ShieldCheck size={16} /> 100% Bio-Equivalent Salt
        </div>
      </div>

      <div className="substitutes-grid">
        {substitutes.map((sub, idx) => {
          const savings = sub.savingsVsBrand || sub.discountPercent || 50;
          return (
            <div key={sub.id || idx} className="substitute-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="savings-tag-badge">
                    <TrendingDown size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Save {savings}% vs Branded
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    via {sub.recommendedBy || sub.platformName}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  {sub.name}
                </h4>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Mfg: <strong style={{ color: 'var(--text-main)' }}>{sub.manufacturer}</strong>
                </div>

                <div style={{
                  background: 'var(--bg-card)',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Unit Cost:
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                      ₹{sub.unitPrice}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        /{sub.unitType}
                      </span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Pack of {sub.packSize} {sub.unitType}s:
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      ₹{sub.sellingPrice}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={sub.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`buy-platform-btn ${sub.platform}`}
                style={{ padding: '0.65rem 1rem', fontSize: '0.875rem' }}
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
