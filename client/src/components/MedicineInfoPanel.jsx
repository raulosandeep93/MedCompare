import React, { useState } from 'react';
import {
  FlaskConical, AlertTriangle, Info, Heart, Utensils,
  Baby, ChevronDown, ChevronUp, ShieldAlert, CheckCircle2,
  Stethoscope, Building2
} from 'lucide-react';

export default function MedicineInfoPanel({ medicineInfo }) {
  const [expanded, setExpanded] = useState(true);

  if (!medicineInfo) return null;

  const {
    medicineName,
    compositionText,
    manufacturer,
    drugClass,
    uses,
    sideEffects,
    warnings,
    foodInteractions,
    pregnancySafety,
    drugClassHint,
    platformsFound = [],
    disclaimer
  } = medicineInfo;

  const hasRealInfo = (uses?.length > 0 || sideEffects?.length > 0 || warnings?.length > 0);

  const getPregStyle = (text = '') => {
    const lower = text.toLowerCase();
    if (lower.includes('contraindicated')) return { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', color: '#ef4444', icon: '⛔' };
    if (lower.includes('avoid')) return { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', color: '#f59e0b', icon: '⚠️' };
    if (lower.includes('essential') || lower.includes('recommended') || lower.includes('safe')) return { bg: 'rgba(16,185,129,0.12)', border: '#10b981', color: '#10b981', icon: '✅' };
    return { bg: 'rgba(99,102,241,0.10)', border: '#6366f1', color: '#6366f1', icon: 'ℹ️' };
  };
  const pregStyle = pregnancySafety ? getPregStyle(pregnancySafety) : null;

  return (
    <div className="medicine-info-panel" id="medicine-info-panel">
      <div className="mip-header" onClick={() => setExpanded(e => !e)} role="button" aria-expanded={expanded}>
        <div className="mip-header-left">
          <div className="mip-icon-wrap">
            <Stethoscope size={20} />
          </div>
          <div>
            <h3 className="mip-title">Medicine Information</h3>
            <p className="mip-subtitle">
              {drugClass
                ? <span className="mip-drug-class">{drugClass}</span>
                : 'Educational overview for the found medicine'}
              {platformsFound.length > 0 && (
                <span className="mip-found-on"> · Found on {platformsFound.length} platform{platformsFound.length > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
        <button className="mip-toggle-btn" aria-label={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="mip-body">
          {compositionText && (
            <div className="mip-composition-bar">
              <FlaskConical size={14} />
              <span>{compositionText}</span>
            </div>
          )}

          {manufacturer && (
            <div className="mip-manufacturer">
              <Building2 size={13} />
              <span>Manufactured by <strong>{manufacturer}</strong></span>
            </div>
          )}

          {hasRealInfo ? (
            <div className="mip-grid">
              {uses && uses.length > 0 && (
                <div className="mip-card mip-uses">
                  <div className="mip-card-header">
                    <Heart size={16} className="mip-card-icon" style={{ color: '#10b981' }} />
                    <span>Medical Uses</span>
                  </div>
                  <ul className="mip-list">
                    {uses.map((u, i) => (
                      <li key={i} className="mip-list-item">
                        <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sideEffects && sideEffects.length > 0 && (
                <div className="mip-card mip-side-effects">
                  <div className="mip-card-header">
                    <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                    <span>Common Side Effects</span>
                  </div>
                  <ul className="mip-list">
                    {sideEffects.map((s, i) => (
                      <li key={i} className="mip-list-item">
                        <span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {warnings && warnings.length > 0 && (
                <div className="mip-card mip-warnings">
                  <div className="mip-card-header">
                    <ShieldAlert size={16} style={{ color: '#ef4444' }} />
                    <span>Warnings & Precautions</span>
                  </div>
                  <ul className="mip-list">
                    {warnings.map((w, i) => (
                      <li key={i} className="mip-list-item">
                        <span style={{ color: '#ef4444', flexShrink: 0 }}>⚠</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {foodInteractions && foodInteractions.length > 0 && (
                <div className="mip-card mip-food">
                  <div className="mip-card-header">
                    <Utensils size={16} style={{ color: '#8b5cf6' }} />
                    <span>Food & Drug Interactions</span>
                  </div>
                  <ul className="mip-list">
                    {foodInteractions.map((f, i) => (
                      <li key={i} className="mip-list-item">
                        <span style={{ color: '#8b5cf6', flexShrink: 0 }}>→</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            drugClassHint && (
              <div className="mip-hint-bar">
                <Info size={16} />
                <span>{drugClassHint}</span>
              </div>
            )
          )}

          {pregnancySafety && pregStyle && (
            <div
              className="mip-pregnancy-bar"
              style={{ background: pregStyle.bg, borderColor: pregStyle.border, color: pregStyle.color }}
            >
              <Baby size={16} />
              <div>
                <span className="mip-preg-label">Pregnancy Safety: </span>
                <span className="mip-preg-text">{pregStyle.icon} {pregnancySafety}</span>
              </div>
            </div>
          )}

          <div className="mip-disclaimer">
            <Info size={12} />
            <p>{disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
