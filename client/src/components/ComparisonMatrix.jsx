import React, { useState, useRef, useEffect, useCallback } from 'react';
import ComparisonCard from './ComparisonCard';
import { Award, Zap, Tag, Table, MapPin, FlaskConical, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

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

export default function ComparisonMatrix({ data, pincode, city, onOpenPincode, onOpenReportIssue }) {
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'table'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'quick' | 'discount'
  const [sortMode, setSortMode] = useState('price-low'); // 'price-low' | 'speed' | 'default'

  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Mouse drag support
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  // Derive platform data safely — must be before hooks but after useState
  const platforms = data?.platforms || {};
  const winners = data?.comparison || {};

  const platformKeys = data
    ? [
        ...ORDERED_PLATFORMS.filter(k => platforms[k]),
        ...Object.keys(platforms).filter(k => !ORDERED_PLATFORMS.includes(k))
      ]
    : [];

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

  const sortedKeys = [...filteredKeys].sort((a, b) => {
    const itemA = platforms[a]?.topItem;
    const itemB = platforms[b]?.topItem;
    if (itemA && !itemB) return -1;
    if (!itemA && itemB) return 1;
    if (!itemA && !itemB) return 0;
    if (sortMode === 'price-low') {
      const priceA = parseFloat(itemA.unitPrice) || 999999;
      const priceB = parseFloat(itemB.unitPrice) || 999999;
      return priceA - priceB;
    }
    if (sortMode === 'speed') {
      const isUltraA = itemA.deliverySpeedTier === 'ultra-fast' || a === 'zepto';
      const isUltraB = itemB.deliverySpeedTier === 'ultra-fast' || b === 'zepto';
      if (isUltraA && !isUltraB) return -1;
      if (!isUltraA && isUltraB) return 1;
      return (parseFloat(itemA.unitPrice) || 0) - (parseFloat(itemB.unitPrice) || 0);
    }
    return ORDERED_PLATFORMS.indexOf(a) - ORDERED_PLATFORMS.indexOf(b);
  });

  // Update carousel scroll boundaries & active slide index
  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    const slide = carouselRef.current.querySelector('.carousel-slide');
    if (slide && slide.offsetWidth > 0) {
      const idx = Math.round(scrollLeft / (slide.offsetWidth + 20));
      setActiveSlideIndex(Math.max(0, Math.min(idx, sortedKeys.length - 1)));
    }
  }, [sortedKeys.length]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, viewMode]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [data?.query, filterMode, sortMode]);

  // Guard: render nothing if no data yet — must be AFTER all hooks
  if (!data || !data.platforms) {
    return null;
  }

  const handleScrollBy = (dir) => {
    if (!carouselRef.current) return;
    const slide = carouselRef.current.querySelector('.carousel-slide');
    const scrollAmount = slide ? (slide.offsetWidth + 20) : 340;
    carouselRef.current.scrollBy({
      left: dir * scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleScrollToCard = (index) => {
    if (!carouselRef.current) return;
    const slide = carouselRef.current.querySelector('.carousel-slide');
    const scrollAmount = slide ? (slide.offsetWidth + 20) : 340;
    carouselRef.current.scrollTo({
      left: index * scrollAmount,
      behavior: 'smooth'
    });
  };

  // Mouse drag events for horizontal swipe on desktop
  const onMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button, a')) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftPos.current = carouselRef.current.scrollLeft;
  };

  const onMouseMove = (e) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current);
    carouselRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };
  const onMouseLeave = () => {
    isDragging.current = false;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Top Winning Metrics Banner */}
      <div className="comparison-highlight-banner">
        <div className="banner-header">
          <div>
            <h2>
              {data.searchMode === 'composition' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FlaskConical size={20} /> Exact Formulation:
                  </span>
                  <span>{data.query}</span>
                </span>
              ) : (
                `Price & Delivery Comparison for "${data.query}"`
              )}
            </h2>
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
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-card-subtle)', padding: '0.3rem 0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <ArrowUpDown size={13} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="price-low">Top Value (Lowest Unit Price)</option>
                <option value="speed">Fastest Delivery First</option>
                <option value="default">Platform Default</option>
              </select>
            </div>

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
                onClick={() => setViewMode('carousel')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: viewMode === 'carousel' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'carousel' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'carousel' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <SlidersHorizontal size={14} /> Carousel
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
                <Table size={14} /> Table View
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

      {/* Carousel View Mode */}
      {viewMode === 'carousel' && (
        <div className="carousel-wrapper">
          <button
            type="button"
            className="carousel-nav-btn prev"
            onClick={() => handleScrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous platform options"
            style={{
              opacity: canScrollLeft ? 1 : 0,
              pointerEvents: canScrollLeft ? 'auto' : 'none'
            }}
          >
            <ChevronLeft size={22} />
          </button>

          <div
            className="carousel-viewport"
            ref={carouselRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {sortedKeys.map((key) => (
              <div className="carousel-slide" key={key}>
                <ComparisonCard
                  platformKey={key}
                  platformData={platforms[key]}
                  comparisonWinners={winners}
                  onOpenReportIssue={onOpenReportIssue}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            className="carousel-nav-btn next"
            onClick={() => handleScrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Next platform options"
            style={{
              opacity: canScrollRight ? 1 : 0,
              pointerEvents: canScrollRight ? 'auto' : 'none'
            }}
          >
            <ChevronRight size={22} />
          </button>

          {/* Carousel Pagination & Indicator */}
          <div className="carousel-indicators-bar">
            <span className="carousel-counter-label">
              Showing <strong>{activeSlideIndex + 1}–{Math.min(activeSlideIndex + 3, sortedKeys.length)}</strong> of {sortedKeys.length} stores
            </span>
            <div className="carousel-dots-group">
              {sortedKeys.map((k, idx) => (
                <button
                  key={k}
                  className={`carousel-dot ${activeSlideIndex === idx ? 'active' : ''}`}
                  onClick={() => handleScrollToCard(idx)}
                  title={`Jump to ${platforms[k]?.platformName || k}`}
                  aria-label={`Jump to ${platforms[k]?.platformName || k}`}
                />
              ))}
            </div>
            <span className="carousel-swipe-hint">
              Swipe left or right to compare more stores →
            </span>
          </div>
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

      {/* Price Discrepancy / Report Issue Prompt */}
      <div style={{
        marginTop: '1.25rem',
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px dashed var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💡 Notice a price discrepancy, out-of-stock item, or broken pharmacy link for <strong>{data?.query || 'this medicine'}</strong>?</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenReportIssue?.(data?.query || data?.medicineInfo?.medicineName, null)}
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#d97706',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Report this issue
        </button>
      </div>
    </div>
  );
}
