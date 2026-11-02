import React from 'react';
import { X, History, Sparkles, CheckCircle2, Zap, Camera, FlaskConical, Layers, ShieldCheck, Search, MapPin, Mail, SlidersHorizontal, Wrench, Bot, Calculator, TrendingDown, HelpCircle } from 'lucide-react';

const RELEASES = [
  {
    version: 'v1.8.1',
    date: 'November 2, 2026',
    isLatest: true,
    tag: 'Chrome Extension',
    title: 'Smart Medicine Extraction & Prominent "Currently Comparing" Header in Extension',
    highlights: [
      {
        icon: <Search size={15} color="#10b981" />,
        text: 'Prominent "Currently Comparing" Banner: Sidebar and popup now feature a glowing status badge, explicit source platform tag, and bold medicine title so you always know which medicine is being compared.'
      },
      {
        icon: <ShieldCheck size={15} color="#3b82f6" />,
        text: 'Anti-Boilerplate Slogan Filtering: Eliminated bug where pharmacy store slogans (e.g. Truemeds SEO heading) were misidentified as medicine names; intelligent filters reject marketing copy across all 8 platforms.'
      },
      {
        icon: <Zap size={15} color="#f59e0b" />,
        text: 'Multi-Layered Fallback Engine: Added DOM traversal, breadcrumb parsing, URL slug cleaning, and meta tag extraction to guarantee accurate medicine names on Truemeds, Tata 1mg, Apollo, and others.'
      },
      {
        icon: <SlidersHorizontal size={15} color="#8b5cf6" />,
        text: 'Inline Medicine Switcher: Instant "✏️ Change" button and inline search bar directly inside the extension sidebar to easily compare or refine any medicine without leaving the page.'
      }
    ]
  },
  {
    version: 'v1.8.0',
    date: 'November 2, 2026',
    isLatest: false,
    tag: 'UX Redesign',
    title: 'Interactive 3-Card Result Hub — Eliminating Scroll Fatigue with Focused Sections',
    highlights: [
      {
        icon: <Layers size={15} color="#3b82f6" />,
        text: 'Interactive 3-Card Hub: Replaced endless vertical scrolling with clean, 1-tap navigation between Store Comparison, Generic Substitutes, and Clinical Medicine Info.'
      },
      {
        icon: <TrendingDown size={15} color="#10b981" />,
        text: 'Live Micro-Stats on Cards: Summary metrics (lowest store price, generic savings %, active chemical salt) visible right on the hub cards before tapping.'
      },
      {
        icon: <SlidersHorizontal size={15} color="#f59e0b" />,
        text: 'Flexible View Toggle: Instant toggle between Focused View (single section) and Show All Sections (stacked view for power users).'
      },
      {
        icon: <Sparkles size={15} color="#8b5cf6" />,
        text: 'Seamless Cross-Section Links: Generic callout banner smoothly switches to the Generics & Savings tab with automatic focus.'
      }
    ]
  },
  {
    version: 'v1.7.0',
    date: 'November 2, 2026',
    isLatest: false,
    tag: 'Community Roadmap',
    title: 'Live Community Feature Suggestions & Persistent Upvoting Roadmap',
    highlights: [
      {
        icon: <Sparkles size={15} color="#3b82f6" />,
        text: 'Real User Feature Submissions: Cleaned mock placeholder data. Suggestions submitted by users are now verified, stored in the backend, and rendered in real time.'
      },
      {
        icon: <Zap size={15} color="#10b981" />,
        text: 'Live Community Upvoting: Users can upvote features with instant optimistic feedback, backend synchronization, and persistent vote tracking via localStorage.'
      },
      {
        icon: <ShieldCheck size={15} color="#8b5cf6" />,
        text: 'Privacy-Conscious Feedback: Optional submitter email is safely isolated on the backend for release notifications without exposing private contact info to public feeds.'
      },
      {
        icon: <CheckCircle2 size={15} color="#10b981" />,
        text: 'Polished Empty & Loading States: Welcoming zero-state for new ideas, category badges, relative timestamp badges, and inline validation.'
      }
    ]
  },
  {
    version: 'v1.6.0',
    date: 'November 2, 2026',
    isLatest: false,
    tag: 'UI/UX Uplift',
    title: 'Full Responsive Overhaul — Mobile Navigation Drawer, Windows & Mobile Browser Compatibility',
    highlights: [
      {
        icon: <Zap size={15} color="#10b981" />,
        text: 'Mobile Navigation Drawer: Brand-new bottom-sheet menu on small screens giving full access to How It Works, Suggest Feature, Report Issue, Changelog, and Theme Toggle — previously hidden on mobile.'
      },
      {
        icon: <SlidersHorizontal size={15} color="#3b82f6" />,
        text: 'Dynamic Viewport Units (dvh): Modals now use dvh units instead of vh, fixing layout issues with Chrome and Safari\'s collapsible address bars on iOS and Android.'
      },
      {
        icon: <ShieldCheck size={15} color="#8b5cf6" />,
        text: 'Safe Area Insets: Header, footer, and drawer respect notch/safe-area-inset-* for modern phones (iPhone X+, Android Notch devices).'
      },
      {
        icon: <TrendingDown size={15} color="#f59e0b" />,
        text: 'Fluid Typography: Hero title, subtitles, and section headers now use clamp() for smooth scaling between mobile and desktop without jarring size jumps.'
      },
      {
        icon: <CheckCircle2 size={15} color="#10b981" />,
        text: 'Reduced Motion & Accessibility: Comprehensive prefers-reduced-motion support, focus-visible keyboard outlines, and hover-none media query for touch devices.'
      }
    ]
  },
  {
    version: 'v1.5.0',
    date: 'November 2, 2026',
    isLatest: false,
    tag: 'Major Feature',
    title: 'First-Time Welcome Guide, Chronic Refill Annual Calculator & Category Bubbles',
    highlights: [
      {
        icon: <HelpCircle size={15} color="#10b981" />,
        text: 'First-Time User Welcome & Onboarding Guide: Automatic introduction explaining MedCompare\'s mission, 3-step usage guide, key benefits, sample 1-tap searches, and a "Do not show this further" preference checkbox (plus a permanent "How it works" header button).'
      },
      {
        icon: <Calculator size={15} color="#10b981" />,
        text: 'Chronic Refill Annual Savings Calculator: Interactive 1-tab/day vs 2-tabs/day dosage toggle showing total yearly family savings (₹/year) when switching from branded medicines to certified generics.'
      },
      {
        icon: <Sparkles size={15} color="#3b82f6" />,
        text: 'Prominent Generic Callout Banner: Direct high-visibility banner above the comparison matrix highlighting exact generic alternatives and direct jump to verified savings.'
      },
      {
        icon: <Search size={15} color="#f59e0b" />,
        text: '1-Click Quick-Select Category Bubbles: Instant access to top chronic and acute conditions (BP, Diabetes, GERD, Fever, Cholesterol, Calcium, Allergy, Antibiotic) directly beneath the search bar.'
      },
      {
        icon: <Camera size={15} color="#8b5cf6" />,
        text: 'Native Mobile Camera Capture: Dedicated "Take Photo with Camera" option directly launching device camera viewfinder on smartphones for effortless strip scanning.'
      }
    ]
  },
  {
    version: 'v1.4.2',
    date: 'October 5, 2026',
    isLatest: false,
    tag: 'UX Improvement',
    title: 'Platform Availability Shown Inline on Cards',
    highlights: [
      {
        icon: <MapPin size={15} color="#ef4444" />,
        text: 'Cleaner Homepage Layout: Removed the standalone platform availability bar to reclaim space on the page.'
      },
      {
        icon: <CheckCircle2 size={15} color="#10b981" />,
        text: 'Inline Availability Status: Each pharmacy card in the carousel now clearly shows "Not available for your location" (with a location icon and dashed border) when a platform doesn\'t deliver to your PIN code.'
      },
      {
        icon: <Layers size={15} color="#8b5cf6" />,
        text: 'Better Empty State Distinction: Cards now differentiate between a platform that doesn\'t service your area vs. a platform that simply doesn\'t list the specific medicine you searched.'
      }
    ]
  },
  {
    version: 'v1.4.1',
    date: 'October 5, 2026',
    isLatest: false,
    tag: 'Geolocation & Fix',
    title: 'High-Accuracy Geolocation & Pune Pincode Resolution Fix',
    highlights: [
      {
        icon: <MapPin size={15} color="#10b981" />,
        text: 'Accurate Pune Pincode Geocoding: Fixed an OpenStreetMap polygon glitch that erroneously assigned Ward 6 (411011) to Eastern Pune neighborhoods. Viman Nagar, Vadgaon Sheri, and Kharadi now accurately resolve to 411014.'
      },
      {
        icon: <Zap size={15} color="#3b82f6" />,
        text: 'High-Accuracy WiFi/GPS Positioning: Geolocation requests now enable high accuracy by default, preventing desktop and laptop browsers from falling back to coarse ISP exchange coordinates.'
      },
      {
        icon: <CheckCircle2 size={15} color="#8b5cf6" />,
        text: 'Preserved Delivery Location Preference: Manually selected delivery PIN codes are now permanently respected and will not be silently overwritten on homepage refresh.'
      }
    ]
  },
  {
    version: 'v1.4.0',
    date: 'October 4, 2026',
    isLatest: false,
    tag: 'Stability & AI',
    title: 'Critical Rendering Fix, Smart Issue Pre-fill & AI Agent Context',
    highlights: [
      {
        icon: <Wrench size={15} color="#ef4444" />,
        text: 'Critical Blank Screen Fix: Resolved a React Rules-of-Hooks violation in the Comparison Matrix where conditional hook calls (useCallback, useEffect) were crashing the entire app on load.'
      },
      {
        icon: <Mail size={15} color="#f59e0b" />,
        text: 'Gmail SMTP Email Delivery: Issue report notifications now reliably reach the admin inbox via direct Gmail SMTP (SSL/465) with a Google App Password — no more silent failures.'
      },
      {
        icon: <Search size={15} color="#10b981" />,
        text: 'Smart Issue Pre-fill: Opening “Report Issue” from a search result now auto-populates the Medicine Name field with the currently searched drug, saving extra typing.'
      },
      {
        icon: <Bot size={15} color="#8b5cf6" />,
        text: 'AI Development Context System: Established AGENTS.md and a docs/ai/ knowledge base so future AI coding sessions can orient to the codebase instantly without re-scanning files.'
      }
    ]
  },
  {
    version: 'v1.3.0',
    date: 'September 27, 2026',
    isLatest: false,
    tag: 'Autocomplete & UX',
    title: 'Instant Search Autocomplete, Card Carousel, Auto-Geolocation & Issue Reporting',
    highlights: [
      {
        icon: <Search size={15} color="#10b981" />,
        text: 'Live Autocomplete Suggestions: Real-time dropdown for both "Search by name" and "By composition" with chemical salt vs brand badges, category tags, and full keyboard navigation (arrows + enter).'
      },
      {
        icon: <SlidersHorizontal size={15} color="#3b82f6" />,
        text: 'Interactive Card Carousel: Replaced static alternative cards with a responsive horizontal carousel showing top 3 medicines with slide controls (‹ / ›) and dot indicators.'
      },
      {
        icon: <MapPin size={15} color="#8b5cf6" />,
        text: 'Automatic Geolocation: Auto-detects location permission on page landing and reverse-geocodes coordinates into Indian PIN codes, keeping location saved in memory.'
      },
      {
        icon: <Mail size={15} color="#f59e0b" />,
        text: 'Issue Reporting & Direct Email Dispatch: "Report Issue" now logs reports locally and automatically notifies admin (raulosandeep93@gmail.com) via Resend/Nodemailer.'
      },
      {
        icon: <Sparkles size={15} color="#10b981" />,
        text: 'Cleaned Input Bar: Streamlined the search box by removing duplicate scan buttons in favor of the dedicated top "Scan Strip" tab.'
      }
    ]
  },
  {
    version: 'v1.2.0',
    date: 'September 20, 2026',
    isLatest: false,
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
      <div className="modal-card changelog-modal-card" onClick={(e) => e.stopPropagation()}>
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
          <div className="changelog-releases-grid">
            {RELEASES.map((rel) => (
              <div
                key={rel.version}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: rel.isLatest ? '1px solid #10b981' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  position: 'relative',
                  boxShadow: rel.isLatest ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none',
                  gridColumn: rel.isLatest ? '1 / -1' : undefined
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

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: rel.isLatest ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr',
                  gap: '0.5rem'
                }}>
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
