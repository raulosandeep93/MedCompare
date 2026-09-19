import React, { useState } from 'react';
import ComparisonCard from './ComparisonCard';
import { Award, Zap, Tag, LayoutGrid, Table, MapPin, Filter } from 'lucide-react';

const ORDERED_PLATFORMS = [
  'apollo',
  'pharmeasy',
  'onemg',
  'netmeds',
  'truemeds',
  'platinumrx',
  'zepto',
  'amazon'
];

export default function ComparisonMatrix({ data, pincode, city, onOpenPincode }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'quick' | 'discount'

  if (!data || !data.platforms) {
    return null;
  }

  const { platforms, comparison } = data;
  const winners = comparison || {};

  // Sort available platforms based on our canonical order, plus any others
  const platformKeys = [
    ...ORDERED_PLATFORMS.filter(k => platforms[k]),
    ...Object.keys(platforms).filter(k => !ORDERED_PLATFORMS.includes(k))
  ];

  // Filter keys based on active filter
  const filteredKeys = platformKeys.filter(key => {
    const p = platforms[key];
    const item = p?.topItem;
    if (filterMode === 'quick') {
      return item?.deliverySpeedTier === 'ultra-fast' || key === 'zepto' || key === 'apollo';
    }
    if (filterMode === 'discount') {
      return (item?.discountPercent || 0) >= 12;
    }
    return true;
  });

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Top Winning Metrics Banner */}
      <div className="comparison-highlight-banner">
        <div className="banner-header">
          <div>
            <h2>Price & Delivery Comparison for "{data.query}"</h2>
            <div className="pincode-context" style={{ marginTop: '0.25rem' }}>
              <MapPin size={13} color="#10b981" />
              <span>Location: <strong>{pincode}</strong> {city ? `(${city})` : ''}</span>
              <button
                onClick={onOpenPincode}
                style={{ color: '#10b981', textDecoration: 'underline', fontWeight: 600, marginLeft: '0.25rem' }}
              >
                Change PIN
              </button>
              <span style={{ margin: '0 0.5rem', color: 'var(--border-color)' }}>•</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Comparing <strong>{platformKeys.length} Stores</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', background: 'var(--bg-card-subtle)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setFilterMode('all')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: filterMode === 'all' ? 'var(--bg-card)' : 'transparent',
                  color: filterMode === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: filterMode === 'all' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                All ({platformKeys.length})
              </button>
              <button
                onClick={() => setFilterMode('quick')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: filterMode === 'quick' ? 'var(--bg-card)' : 'transparent',
                  color: filterMode === 'quick' ? '#f59e0b' : 'var(--text-muted)',
                  boxShadow: filterMode === 'quick' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                ⚡ Ultra-Fast
              </button>
              <button
                onClick={() => setFilterMode('discount')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: filterMode === 'discount' ? 'var(--bg-card)' : 'transparent',
                  color: filterMode === 'discount' ? '#10b981' : 'var(--text-muted)',
                  boxShadow: filterMode === 'discount' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                🏷️ High Discount
              </button>
            </div>

            {/* View Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-card-subtle)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: viewMode === 'cards' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'cards' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <LayoutGrid size={15} /> Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Table size={15} /> Table View
              </button>
            </div>
          </div>
        </div>

        {/* 3 Winning Badges */}
        <div className="highlight-cards-grid">
          {winners.lowestUnitPrice && (
            <div className="highlight-card lowest-unit">
              <span className="highlight-title">
                <Award size={15} /> Lowest Price / Unit
              </span>
              <span className="highlight-value">
                ₹{winners.lowestUnitPrice.unitPrice}
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  /{winners.lowestUnitPrice.unitType}
                </span>
              </span>
              <span className="highlight-meta">
                Best value on <strong>{winners.lowestUnitPrice.platformName}</strong> (₹{winners.lowestUnitPrice.sellingPrice} for {winners.lowestUnitPrice.packSize} {winners.lowestUnitPrice.unitType}s)
              </span>
            </div>
          )}

          {winners.fastestDelivery && (
            <div className="highlight-card fastest-delivery">
              <span className="highlight-title">
                <Zap size={15} /> Fastest Delivery
              </span>
              <span className="highlight-value" style={{ fontSize: '1.25rem' }}>
                {winners.fastestDelivery.deliveryEstimate}
              </span>
              <span className="highlight-meta">
                Fulfilled by <strong>{winners.fastestDelivery.platformName}</strong>
              </span>
            </div>
          )}

          {winners.highestDiscount && winners.highestDiscount.discountPercent > 0 && (
            <div className="highlight-card highest-discount">
              <span className="highlight-title">
                <Tag size={15} /> Best MRP Discount
              </span>
              <span className="highlight-value">
                {winners.highestDiscount.discountPercent}% OFF
              </span>
              <span className="highlight-meta">
                On <strong>{winners.highestDiscount.platformName}</strong> (Save ₹{(winners.highestDiscount.mrp - winners.highestDiscount.sellingPrice).toFixed(2)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cards View Mode */}
      {viewMode === 'cards' && (
        <div className="platforms-grid">
          {filteredKeys.map((key) => (
            <ComparisonCard
              key={key}
              platformKey={key}
              platformData={platforms[key]}
              comparisonWinners={winners}
            />
          ))}
        </div>
      )}

      {/* Table View Mode */}
      {viewMode === 'table' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
          marginTop: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Platform</th>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Medicine Name</th>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Pack Count</th>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Price / Tablet</th>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Pack Price</th>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Discount</th>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Delivery Timeline</th>
                <th style={{ padding: '1rem', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map((key) => {
                const p = platforms[key];
                const item = p?.topItem;
                return (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>
                      <span className={`platform-badge-logo ${key}`}>{p.platformName}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{item ? item.name : 'No direct match'}</td>
                    <td style={{ padding: '1rem' }}>{item ? `${item.packSize} ${item.unitType}s` : '-'}</td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#10b981' }}>
                      {item ? `₹${item.unitPrice}` : '-'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>
                      {item ? `₹${item.sellingPrice}` : '-'}
                      {item && item.mrp > item.sellingPrice && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textDecoration: 'line-through', marginLeft: '0.4rem' }}>
                          ₹{item.mrp}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {item && item.discountPercent > 0 ? (
                        <span className="discount-tag">{item.discountPercent}% OFF</span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8125rem' }}>{item ? item.deliveryEstimate : '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      {item && (
                        <a
                          href={item.deepLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`buy-platform-btn ${key}`}
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', width: 'auto', display: 'inline-flex' }}
                        >
                          Buy Now
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
