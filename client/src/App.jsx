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
import PlatformAvailabilityBar from './components/PlatformAvailabilityBar';
import { searchMedicines, searchByComposition, getPopularCompositions, checkPlatformAvailability } from './utils/api';
import { Pill, ShieldCheck, Zap, TrendingDown } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('medcompare_theme') || 'light';
  });
  const [pincode, setPincode] = useState('560001');
  const [city, setCity] = useState('Bengaluru');
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
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);

  // Platform delivery availability for current pincode
  const [platformAvailability, setPlatformAvailability] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

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

  const handlePincodeChange = (newPin, newCity) => {
    setPincode(newPin);
    if (newCity) setCity(newCity);
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

  return (
    <div className="app-root">
      <Header
        pincode={pincode}
        city={city}
        onOpenPincode={() => setIsPincodeModalOpen(true)}
        onOpenReportIssue={() => setIsReportModalOpen(true)}
        onOpenSuggestFeature={() => setIsSuggestModalOpen(true)}
        onOpenChangelogs={() => setIsChangelogModalOpen(true)}
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

        {/* Platform Delivery Availability Bar */}
        <PlatformAvailabilityBar
          availability={platformAvailability}
          loading={availabilityLoading}
          pincode={pincode}
          onRefresh={() => runAvailabilityCheck(pincode)}
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
              onOpenPincode={() => setIsPincodeModalOpen(true)}
            />

            {/* Generic Substitutes Section */}
            {data.genericSubstitutes && data.genericSubstitutes.length > 0 && (
              <SubstituteSection substitutes={data.genericSubstitutes} />
            )}
          </>
        )}

        {/* How It Works Feature Cards */}
        <section style={{ marginTop: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Why Compare on MedCompare?
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              Different pharmacy apps in India charge different prices for the exact same drug
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <TrendingDown size={20} />
              </div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Per-Tablet Normalization
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Apollo might sell a 30s pack while Truemeds sells a 15s pack. We normalize everything to <strong>₹ / tablet</strong> so you never get tricked by pack size differences.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Zap size={20} />
              </div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Live Delivery SLAs
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Need it in 2 hours? Choose Apollo. Ordering a monthly chronic refill? Choose Truemeds or PlatinumRx to save up to 70% with 24-48h delivery.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ShieldCheck size={20} />
              </div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Unbiased Platform Choice
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                We don't lock you in. We give you full transparency and direct 1-click links to buy from the pharmacy that gives you the best deal.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            MedCompare India • Unifying Medicine Pricing Across 8 Leading Platforms: Apollo Pharmacy, PharmEasy, Tata 1mg, Netmeds, Truemeds, PlatinumRx, Zepto & Amazon Pharmacy.
          </p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
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
        currentMedicine={activeMedicine}
      />

      <SuggestFeatureModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />

      <ChangelogModal
        isOpen={isChangelogModalOpen}
        onClose={() => setIsChangelogModalOpen(false)}
      />
    </div>
  );
}
