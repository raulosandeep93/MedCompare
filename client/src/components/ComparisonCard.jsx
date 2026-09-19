import React from 'react';
import { ExternalLink, Zap, Award, Tag, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ComparisonCard({ platformKey, platformData, comparisonWinners }) {
  const { platformName, topItem } = platformData;

  const isLowestUnit = comparisonWinners?.lowestUnitPrice?.platform === platformKey;
  const isFastestDelivery = comparisonWinners?.fastestDelivery?.platform === platformKey;
  const isHighestDiscount = comparisonWinners?.highestDiscount?.platform === platformKey;

  const getWinnerRibbon = () => {
    if (isLowestUnit) {
      return (
        <div className="card-winner-ribbon" title="Lowest price per tablet/unit">
          <Award size={13} /> Lowest Price / Unit
        </div>
      );
    }
    if (isFastestDelivery) {
      return (
        <div
          className="card-winner-ribbon"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          title="Fastest delivery in your PIN code"
        >
          <Zap size={13} /> Fastest Delivery
        </div>
      );
    }
    if (isHighestDiscount && topItem?.discountPercent > 10) {
      return (
        <div
          className="card-winner-ribbon"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
          title="Highest percentage discount on MRP"
        >
          <Tag size={13} /> Best Discount
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`platform-column-card ${isLowestUnit ? 'is-winner' : ''}`}>
      {getWinnerRibbon()}

      <div className="platform-header">
        <div className="platform-identity">
          <span className={`platform-badge-logo ${platformKey}`}>
            {platformName}
          </span>
        </div>
        {topItem && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {topItem.inStock ? '🟢 Available' : '🔴 Out of Stock'}
          </span>
        )}
      </div>

      <div className="platform-body">
        {topItem ? (
          <>
            <h3 className="medicine-name" title={topItem.name}>
              {topItem.name}
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pack-pill">
                Pack: <strong>{topItem.packSize} {topItem.unitType}s</strong>
              </span>
              {topItem.manufacturer && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  by {topItem.manufacturer}
                </span>
              )}
            </div>

            {/* Pricing Matrix Box */}
            <div className="pricing-matrix-box">
              <div className="unit-price-row">
                <span className="unit-price-label">Normalized Unit Cost:</span>
                <span className="unit-price-value">
                  ₹{topItem.unitPrice}
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    /{topItem.unitType}
                  </span>
                </span>
              </div>

              <div className="pack-price-row">
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Pack Price:</span>
                <div>
                  {topItem.mrp > topItem.sellingPrice && (
                    <span className="mrp-strike">₹{topItem.mrp}</span>
                  )}
                  <span className="pack-price-text">₹{topItem.sellingPrice}</span>
                  {topItem.discountPercent > 0 && (
                    <span className="discount-tag" style={{ marginLeft: '0.4rem' }}>
                      {topItem.discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery & Metadata List */}
            <div className="card-meta-list">
              <div className="meta-item delivery">
                <Clock size={15} color={isFastestDelivery ? '#f59e0b' : '#10b981'} />
                <span>{topItem.deliveryEstimate}</span>
              </div>

              <div className="meta-item stock">
                {topItem.inStock ? (
                  <>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span className="stock-in">In Stock • Verified Seller</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={15} color="#ef4444" />
                    <span className="stock-out">Currently Unavailable</span>
                  </>
                )}
              </div>

              {topItem.prescriptionRequired && (
                <div className="meta-item" style={{ color: 'var(--text-muted)' }}>
                  <ShieldCheck size={15} />
                  <span>Doctor Prescription (Rx) Required</span>
                </div>
              )}
            </div>

            {/* Direct 1-Click Platform Redirection CTA */}
            <a
              href={topItem.deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`buy-platform-btn ${platformKey}`}
              id={`buy-on-${platformKey}-btn`}
            >
              <span>Buy on {platformName}</span>
              <ExternalLink size={16} />
            </a>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            <AlertCircle size={32} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              No Direct Match Found
            </h4>
            <p style={{ fontSize: '0.8125rem' }}>
              This drug or exact brand may be listed under an alternative generic salt on {platformName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
