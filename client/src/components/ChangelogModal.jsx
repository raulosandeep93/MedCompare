import React from 'react';
import { X, History, Sparkles, CheckCircle2, Zap, Camera, FlaskConical, Layers, ShieldCheck } from 'lucide-react';

const RELEASES = [
  {
    version: 'v1.2.0',
    date: 'September 20, 2026',
    isLatest: true,
    tag: 'Major Feature',
    title: 'Multi-Ingredient Composition & Chemical Salt Aggregator',
    highlights: [
      {
        icon: <FlaskConical size={15} color="#10b981" />,
        text: 'Search by Composition: Input single or multiple active ingredients (e.g. Amoxicillin + Clavulanic Acid) to find exact formulations.'
      },
      {
        icon: <CheckCircle2 size={15} color="#10b981" />,
        text: 'Exact Combination Match Engine: Strictly filters and scores medicines to ensure all requested salts are present in the formulation.'
      },
      {
        icon: <Layers size={15} color="#10b981" />,
        text: 'Curated Formulations Directory: 1-click test chips for popular Indian combinations (Augmentin, Glycomet GP, Pan-D, Telma AM, Zerodol-SP).'
      },
      {
        icon: <Sparkles size={15} color="#10b981" />,
        text: 'Visual Verification Badges: Cards now prominently display verified exact-combination pills and parsed chemical salt names.'
      }
    ]
  },
  {
    version: 'v1.1.0',
    date: 'September 2026',
    isLatest: false,
    tag: 'OCR & Delivery SLAs',
    title: 'Medicine Strip Photo Scanner & 10-Min Quick Commerce',
    highlights: [
      {
        icon: <Camera size={15} color="#3b82f6" />,
        text: 'Medicine Packaging OCR Scanner: Upload photos of medicine strips or boxes to automatically detect brand names, salts, and strengths.'
      },
      {
        icon: <Zap size={15} color="#f59e0b" />,
        text: 'Delivery Speed Tiers: Added live delivery SLA estimation, differentiating between Zepto (10-min), Apollo (2-hr), and standard delivery.'
      },
      {
        icon: <ShieldCheck size={15} color="#3b82f6" />,
        text: 'Generic Substitutes Engine: Direct matching of CDSCO-approved generic equivalents offering up to 70% savings.'
      }
    ]
  },
  {
    version: 'v1.0.0',
    date: 'August 2026',
    isLatest: false,
    tag: 'Initial Launch',
    title: '8-Platform Unified Indian Medicine Price Aggregator',
    highlights: [
      {
        icon: <CheckCircle2 size={15} color="#8b5cf6" />,
        text: 'Simultaneous 8-store live queries across Apollo, PharmEasy, Tata 1mg, Netmeds, Truemeds, PlatinumRx, Zepto, and Amazon Pharmacy.'
      },
      {
        icon: <CheckCircle2 size={15} color="#8b5cf6" />,
        text: 'Normalized per-tablet and per-ml unit pricing calculation to remove confusion from varying pack sizes.'
      },
      {
        icon: <CheckCircle2 size={15} color="#8b5cf6" />,
        text: 'Dark and Light mode support with automatic local persistence and smooth healthcare aesthetic.'
      }
    ]
  }
];

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.12)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Product Changelogs</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Track latest releases, enhancements, and platform additions
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {RELEASES.map((rel) => (
              <div
                key={rel.version}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: rel.isLatest ? '1px solid #10b981' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  position: 'relative',
                  boxShadow: rel.isLatest ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {rel.version}
                    </span>
                    {rel.isLatest && (
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff'
                      }}>
                        Current
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      background: 'rgba(139, 92, 246, 0.12)',
                      color: '#8b5cf6'
                    }}>
                      {rel.tag}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {rel.date}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.75rem 0' }}>
                  {rel.title}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {rel.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ marginTop: '2px', flexShrink: 0 }}>{h.icon}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {h.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
