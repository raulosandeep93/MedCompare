import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ComparisonMatrix from './components/ComparisonMatrix';
import SubstituteSection from './components/SubstituteSection';
import PincodeModal from './components/PincodeModal';
import StripScannerModal from './components/StripScannerModal';
import ReportIssueModal from './components/ReportIssueModal';
import SuggestFeatureModal from './components/SuggestFeatureModal';
import ChangelogModal from './components/ChangelogModal';
import WelcomeGuideModal from './components/WelcomeGuideModal';

import MedicineInfoPanel from './components/MedicineInfoPanel';
import { searchMedicines, searchByComposition, getPopularCompositions, checkPlatformAvailability, reverseGeocodeLocation, getPreciseLocation } from './utils/api';
import { ShieldCheck, Zap, TrendingDown } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('medcompare_theme') || 'light';
  });

  // Location kept in memory (localStorage)
  const [pincode, setPincode] = useState(() => {
    try {
      const saved = localStorage.getItem('medcompare_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pincode) return parsed.pincode;
      }
    } catch {}
    return '560001';
  });
  const [city, setCity] = useState(() => {
    try {
      const saved = localStorage.getItem('medcompare_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.city) return parsed.city;
      }
    } catch {}
    return 'Bengaluru';
  });
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'detecting' | 'detected' | 'denied'

  const [searchMode, setSearchMode] = useState('name'); // 'name' | 'composition'
  const [query, setQuery] = useState('');
  const [activeMedicine, setActiveMedicine] = useState('');
  const [activeComposition, setActiveComposition] = useState(null);
  const [exactMatchOnly, setExactMatchOnly] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Recent searches – persisted in localStorage, capped at 5
  const [popularMedicines, setPopularMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('medcompare_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [popularCompositions, setPopularCompositions] = useState([]);

  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState({ medicineName: '', platform: '' });
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    try {
      return localStorage.getItem('medcompare_onboarding_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  // Platform delivery availability for current pincode
  const [platformAvailability, setPlatformAvailability] = useState({});
  const [_availabilityLoading, setAvailabilityLoading] = useState(false);

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medcompare_theme', theme);
  }, [theme]);

  // Load popular composition formulations list from server
  useEffect(() => {
    getPopularCompositions()
      .then((comps) => {
        if (comps && comps.length > 0) setPopularCompositions(comps);
      })
      .catch(() => {});
  }, []);

  // Persist and update recent searches list (max 5, newest first)
  const recordSearch = (name) => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    setPopularMedicines((prev) => {
      const filtered = prev.filter((m) => m.name.toLowerCase() !== trimmed.toLowerCase());
      const updated = [{ name: trimmed }, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('medcompare_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Derive availability from a search result (avoids a duplicate API call)
  const deriveAvailabilityFromData = useCallback((searchData) => {
    if (!searchData || !searchData.platforms) return;
    const derived = {};
    for (const [key, platform] of Object.entries(searchData.platforms)) {
      derived[key] = {
        platformName: platform.platformName,
        available: platform.available === true || platform.count > 0
      };
    }
    setPlatformAvailability(derived);
  }, []);

  // Explicit availability check (used on pincode change when no search is active)
  const runAvailabilityCheck = useCallback(async (pin) => {
    setAvailabilityLoading(true);
    try {
      const av = await checkPlatformAvailability(pin);
      setPlatformAvailability(av);
    } catch {
      // silently fail – bar just stays empty
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  // Auto-request location permission on page landing and auto-set delivery location
  useEffect(() => {
    // Initial check for currently stored in-memory location
    runAvailabilityCheck(pincode);

    // If user explicitly set their preferred location manually,
    // do not let background auto-geolocation overwrite it on reload.
    let isManualSaved = false;
    let savedPincode = null;
    try {
      const savedRaw = localStorage.getItem('medcompare_user_location');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        isManualSaved = parsed.isManual === true;
        savedPincode = parsed.pincode;
      }
    } catch {}

    // Respect user's explicit manual pincode (unless it was the old erroneous 411011)
    if (isManualSaved && savedPincode && savedPincode !== '411011') {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    setLocationStatus('detecting');

    getPreciseLocation({ timeout: 9000 })
      .then(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const loc = await reverseGeocodeLocation(latitude, longitude);
          if (loc && loc.pincode) {
            const detectedPin = loc.pincode;
            const detectedCity = loc.city || 'India';
            setPincode(detectedPin);
            setCity(detectedCity);
            setLocationStatus('detected');

            // Persist to memory
            try {
              localStorage.setItem('medcompare_user_location', JSON.stringify({
                pincode: detectedPin,
                city: detectedCity,
                state: loc.state,
                lat: latitude,
                lng: longitude,
                isManual: false,
                updatedAt: Date.now()
              }));
            } catch {}

            // Re-probe live stores for the newly detected pincode
            runAvailabilityCheck(detectedPin);
          } else {
            setLocationStatus('idle');
          }
        } catch (err) {
          console.warn('Auto-location reverse geocoding failed:', err);
          setLocationStatus('idle');
        }
      })
      .catch((err) => {
        // User denied or browser error – retain in-memory location without disturbing user
        console.log('Location permission not granted or unavailable:', err.message);
        setLocationStatus('denied');
      });
  }, [runAvailabilityCheck]);

  const executeSearch = async (searchQuery, targetPin = pincode) => {
    if (!searchQuery || !searchQuery.trim()) return;

    const q = searchQuery.trim();
    setLoading(true);
    setError('');
    setActiveMedicine(q);
    setActiveComposition(null);

    try {
      const result = await searchMedicines(q, targetPin);
      setData(result);
      recordSearch(q);
      deriveAvailabilityFromData(result);
    } catch (err) {
      console.error('Search error:', err);
      setError('Unable to fetch live prices from pharmacy partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const executeCompositionSearch = async (ingredients, exactMatch = true, targetPin = pincode) => {
    if (!ingredients || ingredients.length === 0) return;

    setLoading(true);
    setError('');
    setActiveComposition(ingredients);
    setExactMatchOnly(exactMatch);

    const label = ingredients
      .map(i => (typeof i === 'string' ? i : i.name))
      .filter(Boolean)
      .join(' + ');
    setActiveMedicine(label);

    try {
      const result = await searchByComposition(ingredients, targetPin, { exactMatch });
      setData(result);
    } catch (err) {
      console.error('Composition search error:', err);
      setError('Unable to search formulations from pharmacy partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWelcomeModal = (doNotShowAgain) => {
    setIsWelcomeModalOpen(false);
    if (doNotShowAgain) {
      try {
        localStorage.setItem('medcompare_onboarding_dismissed', 'true');
      } catch {}
    }
  };

  const handleSelectSampleFromWelcome = (medicineName) => {
    setQuery(medicineName);
    executeSearch(medicineName, pincode);
  };

  const handlePincodeChange = (newPin, newCity, meta = {}) => {
    setPincode(newPin);
    if (newCity) setCity(newCity);
    setLocationStatus('detected');
    try {
      localStorage.setItem('medcompare_user_location', JSON.stringify({
        pincode: newPin,
        city: newCity || city,
        isManual: meta.isManual !== false,
        updatedAt: Date.now()
      }));
    } catch {}
    if (searchMode === 'composition' && activeComposition) {
      executeCompositionSearch(activeComposition, exactMatchOnly, newPin);
    } else if (activeMedicine) {
      executeSearch(activeMedicine, newPin);
    } else {
      // No active search yet – just check availability for the new pin
      runAvailabilityCheck(newPin);
    }
  };

  const handleDetectedMedicine = (detectedName) => {
    setSearchMode('name');
    setQuery(detectedName);
    executeSearch(detectedName, pincode);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenReportIssue = (overrideMedicine, overridePlatform) => {
    const med = (overrideMedicine || activeMedicine || query || data?.query || data?.medicineInfo?.medicineName || '').trim();
    setReportModalData({
      medicineName: med,
      platform: overridePlatform || 'All Stores / General'
    });
    setIsReportModalOpen(true);
  };

  return (
    <div className="app-root">
      <Header
        pincode={pincode}
        city={city}
        locationStatus={locationStatus}
        onOpenPincode={() => setIsPincodeModalOpen(true)}
        onOpenReportIssue={() => handleOpenReportIssue()}
        onOpenSuggestFeature={() => setIsSuggestModalOpen(true)}
        onOpenChangelogs={() => setIsChangelogModalOpen(true)}
        onOpenWelcomeGuide={() => setIsWelcomeModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="app-container">

        <SearchSection
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          query={query}
          setQuery={setQuery}
          onSearch={(q) => executeSearch(q, pincode)}
          onCompositionSearch={(ingredients, exact) => executeCompositionSearch(ingredients, exact, pincode)}
          onOpenScanner={() => setIsScannerModalOpen(true)}
          loading={loading}
          popularMedicines={popularMedicines}
          popularCompositions={popularCompositions}
          activeMedicine={activeMedicine}
          activeIngredients={activeComposition}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="loader-box">
            <div className="spinner" />
            <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>
              Querying 8 Pharmacy Platforms Simultaneously...
            </p>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Apollo, PharmEasy, Tata 1mg, Netmeds, Truemeds, PlatinumRx, Zepto & Amazon Pharmacy for PIN {pincode}
            </span>
          </div>
        )}

        {/* Error Notice */}
        {error && !loading && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.9375rem'
          }}>
            {error}
          </div>
        )}

        {/* Comparison Matrix Display */}
        {!loading && data && (
          <>
            <ComparisonMatrix
              data={data}
              pincode={pincode}
              city={city}
              platformAvailability={platformAvailability}
              onOpenPincode={() => setIsPincodeModalOpen(true)}
              onOpenReportIssue={handleOpenReportIssue}
            />

            {/* Generic Substitutes & Chronic Savings Calculator */}
            {data.genericSubstitutes && data.genericSubstitutes.length > 0 && (
              <SubstituteSection
                substitutes={data.genericSubstitutes}
                brandItem={data.comparison?.lowestUnitPrice || Object.values(data.platforms || {}).find(p => p?.topItem)?.topItem}
                searchedMedicine={data.query}
              />
            )}

            {/* Medicine Information Panel — uses, side effects, warnings */}
            {data.medicineInfo && (
              <MedicineInfoPanel medicineInfo={data.medicineInfo} />
            )}
          </>
        )}

        {/* Why Compare Feature Cards */}
        <section className="why-compare-section">
          <div className="why-compare-header">
            <h3 className="why-compare-title">Why Compare on MedCompare?</h3>
            <p className="why-compare-subtitle">
              Different pharmacy apps in India charge different prices for the exact same drug
            </p>
          </div>

          <div className="why-compare-grid">
            <div className="why-card">
              <div className="why-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <TrendingDown size={20} />
              </div>
              <h4 className="why-card-title">Per-Tablet Normalization</h4>
              <p className="why-card-desc">
                Apollo might sell a 30s pack while Truemeds sells a 15s pack. We normalize everything to <strong>₹ / tablet</strong> so you never get tricked by pack size differences.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <Zap size={20} />
              </div>
              <h4 className="why-card-title">Live Delivery SLAs</h4>
              <p className="why-card-desc">
                Need it in 2 hours? Choose Apollo. Ordering a monthly chronic refill? Choose Truemeds or PlatinumRx to save up to 70% with 24-48h delivery.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                <ShieldCheck size={20} />
              </div>
              <h4 className="why-card-title">Unbiased Platform Choice</h4>
              <p className="why-card-desc">
                We don't lock you in. We give you full transparency and direct 1-click links to buy from the pharmacy that gives you the best deal.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-platform-row">
            {['Apollo', 'PharmEasy', 'Tata 1mg', 'Netmeds', 'Truemeds', 'PlatinumRx', 'Zepto', 'Amazon'].map(p => (
              <span key={p} className="footer-platform-tag">{p}</span>
            ))}
          </div>
          <p className="footer-tagline">MedCompare India • Unifying Medicine Pricing Across 8 Leading Platforms</p>
          <p className="footer-legal">
            All trademarks, logos, and pharmacy names belong to their respective owners. Live pricing and availability are fetched in real-time.
          </p>
        </footer>
      </main>

      {/* Modals */}
      <PincodeModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        currentPincode={pincode}
        onSelectPincode={handlePincodeChange}
      />

      <StripScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onDetectedMedicine={handleDetectedMedicine}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentMedicine={reportModalData.medicineName || activeMedicine || query || data?.query || data?.medicineInfo?.medicineName || ''}
        initialPlatform={reportModalData.platform || 'All Stores / General'}
      />

      <SuggestFeatureModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />

      <ChangelogModal
        isOpen={isChangelogModalOpen}
        onClose={() => setIsChangelogModalOpen(false)}
      />

      <WelcomeGuideModal
        isOpen={isWelcomeModalOpen}
        onClose={handleCloseWelcomeModal}
        onSelectSample={handleSelectSampleFromWelcome}
      />
    </div>
  );
}
