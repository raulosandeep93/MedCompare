import React, { useState, useEffect, useRef } from 'react';
import { Search, Camera, Sparkles, FlaskConical, Plus, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { fetchSuggestions } from '../utils/api';
import SearchSuggestions from './SearchSuggestions';

const COMMON_SALTS = [
  'Paracetamol',
  'Amoxicillin',
  'Clavulanic Acid',
  'Metformin',
  'Glimepiride',
  'Pantoprazole',
  'Domperidone',
  'Montelukast',
  'Levocetirizine',
  'Telmisartan',
  'Amlodipine',
  'Caffeine',
  'Aceclofenac',
  'Serratiopeptidase'
];

const QUICK_CATEGORIES = [
  { label: 'Blood Pressure', medicine: 'Telma 40', icon: '🩺', badge: 'BP' },
  { label: 'Diabetes', medicine: 'Glycomet GP 2', icon: '🩸', badge: 'Sugar' },
  { label: 'Acidity & Gas', medicine: 'Pan 40', icon: '💊', badge: 'GERD' },
  { label: 'Fever & Pain', medicine: 'Dolo 650', icon: '🤒', badge: 'Pain' },
  { label: 'Cholesterol', medicine: 'Rosuvas 10', icon: '🫀', badge: 'Lipid' },
  { label: 'Bones & Calcium', medicine: 'Shelcal 500', icon: '🦴', badge: 'Vitamins' },
  { label: 'Allergy & Cold', medicine: 'Montair LC', icon: '🤧', badge: 'Allergy' },
  { label: 'Antibiotic', medicine: 'Augmentin 625 Duo', icon: '🛡️', badge: 'Infection' }
];

export default function SearchSection({
  searchMode = 'name',
  setSearchMode,
  query,
  setQuery,
  onSearch,
  onCompositionSearch,
  onOpenScanner,
  loading,
  popularMedicines,
  _popularCompositions = [],
  activeMedicine,
  activeIngredients = []
}) {
  // Local state for composition builder
  const [ingredientName, setIngredientName] = useState('');
  const [ingredients, setIngredients] = useState(() => {
    if (activeIngredients && activeIngredients.length > 0) {
      return activeIngredients.map((ing, idx) =>
        typeof ing === 'string'
          ? { id: idx, name: ing }
          : { id: idx, name: ing.name }
      );
    }
    return [];
  });

  // ── Autocomplete state ──
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [saltSuggestions, setSaltSuggestions] = useState([]);
  const [showSaltSuggestions, setShowSaltSuggestions] = useState(false);

  // Refs for outside-click detection and suggestion suppression
  const nameSearchWrapRef = useRef(null);
  const saltInputWrapRef = useRef(null);
  const skipNameSuggestionsRef = useRef(false);

  // ── Debounced fetch for name search ──
  useEffect(() => {
    if (skipNameSuggestionsRef.current) {
      skipNameSuggestionsRef.current = false;
      return;
    }

    if (!query || query.trim().length < 2) {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      if (skipNameSuggestionsRef.current) return;
      const results = await fetchSuggestions(query, 'name');
      if (!skipNameSuggestionsRef.current) {
        setNameSuggestions(results);
        setShowNameSuggestions(results.length > 0);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Debounced fetch for composition salt input ──
  useEffect(() => {
    if (!ingredientName || ingredientName.trim().length < 2) {
      setSaltSuggestions([]);
      setShowSaltSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await fetchSuggestions(ingredientName, 'composition');
      setSaltSuggestions(results);
      setShowSaltSuggestions(results.length > 0);
    }, 220);
    return () => clearTimeout(timer);
  }, [ingredientName]);

  // ── Close on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (nameSearchWrapRef.current && !nameSearchWrapRef.current.contains(e.target)) {
        setShowNameSuggestions(false);
      }
      if (saltInputWrapRef.current && !saltInputWrapRef.current.contains(e.target)) {
        setShowSaltSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Execute search and suppress auto-suggestion popup
  const executeNameSearch = (searchTerm) => {
    skipNameSuggestionsRef.current = true;
    setShowNameSuggestions(false);
    setNameSuggestions([]);
    setQuery(searchTerm);
    onSearch(searchTerm);
  };

  // Submit name search
  const handleNameSubmit = (e) => {
    e.preventDefault();
    skipNameSuggestionsRef.current = true;
    setShowNameSuggestions(false);
    setNameSuggestions([]);
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  // Handle name suggestion selection
  const handleNameSuggestionSelect = (item) => {
    executeNameSearch(item.name);
  };

  // Handle salt suggestion selection
  const handleSaltSuggestionSelect = (item) => {
    setShowSaltSuggestions(false);
    handleAddIngredient(item.name);
  };

  // Add new ingredient to tag tray
  const handleAddIngredient = (nameToAdd = ingredientName) => {
    const cleanName = (nameToAdd || '').trim();
    if (!cleanName) return;

    // Check if already present
    const exists = ingredients.some(
      (i) => i.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (!exists) {
      setIngredients((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          name: cleanName
        }
      ]);
    }
    setIngredientName('');
  };

  // Remove an ingredient
  const handleRemoveIngredient = (idToRemove) => {
    setIngredients((prev) => prev.filter((i) => i.id !== idToRemove));
  };

  // Reset all ingredients
  const handleResetIngredients = () => {
    setIngredients([]);
    setIngredientName('');
  };

  // Submit composition search
  const handleCompositionSubmit = (e) => {
    e.preventDefault();
    if (ingredientName.trim()) {
      handleAddIngredient();
      return;
    }
    if (ingredients.length > 0) {
      onCompositionSearch(ingredients, true);
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-badge">
        <Sparkles size={14} /> Live Comparison across 8 Major Pharmacy Platforms
      </div>

      <h1 className="hero-title">
        Never Overpay for <span>Medicines</span> in India
      </h1>

      <p className="hero-subtitle">
        Real-time price comparison across leading e-pharmacies. Compare pack sizes, per-tablet costs, delivery speeds, and verified multi-ingredient formulations.
      </p>

      {/* 3-Way Search Mode Switcher */}
      <div className="search-mode-tabs-container">
        <div className="search-mode-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={searchMode === 'name'}
            className={`mode-tab-btn ${searchMode === 'name' ? 'active' : ''}`}
            onClick={() => setSearchMode('name')}
            id="tab-search-by-name"
          >
            <Search size={16} />
            <span>Search by Name</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={searchMode === 'composition'}
            className={`mode-tab-btn ${searchMode === 'composition' ? 'active' : ''}`}
            onClick={() => setSearchMode('composition')}
            id="tab-search-by-composition"
          >
            <FlaskConical size={16} />
            <span>By Composition (Salts)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="mode-tab-btn"
            onClick={onOpenScanner}
            id="tab-scan-strip"
          >
            <Camera size={16} color="#10b981" />
            <span>Scan Strip (Photo)</span>
          </button>
        </div>
      </div>

      {/* Search Container */}
      <div className="search-wrapper">
        {searchMode === 'name' ? (
          /* Mode 1: Search By Medicine Name */
          <>
            <div className="search-autocomplete-wrap" ref={nameSearchWrapRef}>
              <form onSubmit={handleNameSubmit} className="search-box-card">
                <Search size={20} color="var(--text-muted)" style={{ marginLeft: '0.5rem' }} />

                <input
                  type="text"
                  className="search-input-field"
                  placeholder="Search medicine name or salt (e.g. Dolo 650, Telma 40, Augmentin 625)..."
                  value={query}
                  onChange={(e) => {
                    skipNameSuggestionsRef.current = false;
                    setQuery(e.target.value);
                  }}
                  onFocus={() => !skipNameSuggestionsRef.current && nameSuggestions.length > 0 && setShowNameSuggestions(true)}
                  id="medicine-search-input"
                  autoComplete="off"
                />

                <button
                  type="submit"
                  className="search-submit-btn"
                  disabled={loading}
                  id="execute-search-btn"
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      <span>Comparing...</span>
                    </>
                  ) : (
                    <span>Compare</span>
                  )}
                </button>
              </form>

              <SearchSuggestions
                suggestions={nameSuggestions}
                visible={showNameSuggestions}
                query={query}
                onSelect={handleNameSuggestionSelect}
                onClose={() => setShowNameSuggestions(false)}
                mode="name"
              />
            </div>

            {/* 1-Click Quick Category Bubbles */}
            <div className="quick-categories-container">
              <div className="quick-categories-label">
                <span>Top Health Conditions & Daily Medicines:</span>
              </div>
              <div className="quick-categories-scroll">
                {QUICK_CATEGORIES.map((cat) => {
                  const isActive = activeMedicine?.toLowerCase() === cat.medicine.toLowerCase() ||
                                   query?.trim().toLowerCase() === cat.medicine.toLowerCase();
                  return (
                    <button
                      key={cat.medicine}
                      type="button"
                      className={`category-bubble-btn ${isActive ? 'active' : ''}`}
                      onClick={() => executeNameSearch(cat.medicine)}
                      title={`Compare prices for ${cat.medicine} (${cat.label})`}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <div className="cat-text-group">
                        <span className="cat-label">{cat.label}</span>
                        <span className="cat-medicine">{cat.medicine}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent searches chips – only shown after the user has searched */}
            {popularMedicines && popularMedicines.length > 0 && (
              <div className="quick-chips-wrap">
                <span className="chips-label">Recent Searches:</span>
                {popularMedicines.map((med) => {
                  const isActive = activeMedicine?.toLowerCase() === med.name.toLowerCase();
                  return (
                    <button
                      key={med.name}
                      className={`chip-btn ${isActive ? 'active' : ''}`}
                      onClick={() => executeNameSearch(med.name)}
                    >
                      {med.name}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Mode 2: Multi-Ingredient / Composition Builder */
          <div className="composition-builder-card">
            {/* Header */}
            <div className="composition-header">
              <div className="composition-header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlaskConical size={20} color="#10b981" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                    Medicine Composition & Salt Matcher
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Add active salts to find all medicines that match the combination.
                </p>
              </div>
            </div>

            {/* Active Ingredients Tray with Reset Option */}
            <div className="ingredients-tray">
              <div className="tray-header">
                <span className="tray-label">
                  Active Formulation Ingredients ({ingredients.length}):
                </span>
                {ingredients.length > 0 && (
                  <button
                    type="button"
                    className="reset-ingredients-btn"
                    onClick={handleResetIngredients}
                    title="Reset all ingredients"
                    id="reset-formulation-btn"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              <div className="ingredient-chips-list">
                {ingredients.length === 0 ? (
                  <span className="tray-empty-hint">
                    No ingredients added yet. Type an active salt below or choose from quick salts.
                  </span>
                ) : (
                  ingredients.map((ing) => (
                    <div key={ing.id} className="ingredient-chip-tag">
                      <span className="salt-name">{ing.name}</span>
                      <button
                        type="button"
                        className="remove-salt-btn"
                        onClick={() => handleRemoveIngredient(ing.id)}
                        title={`Remove ${ing.name}`}
                        aria-label={`Remove ${ing.name}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input Row: Wide salt input + Add Salt button */}
            <form onSubmit={handleCompositionSubmit} className="composition-input-row">
              <div className="input-group-salt" ref={saltInputWrapRef}>
                <input
                  type="text"
                  className="composition-text-input"
                  placeholder="e.g. Paracetamol, Metformin, Amoxicillin (press Enter to add)..."
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  onFocus={() => saltSuggestions.length > 0 && setShowSaltSuggestions(true)}
                  id="composition-salt-input"
                  autoComplete="off"
                />
                <SearchSuggestions
                  suggestions={saltSuggestions}
                  visible={showSaltSuggestions}
                  query={ingredientName}
                  onSelect={handleSaltSuggestionSelect}
                  onClose={() => setShowSaltSuggestions(false)}
                  mode="composition"
                />
              </div>

              <button
                type="button"
                className="add-salt-btn"
                onClick={() => handleAddIngredient()}
                disabled={!ingredientName.trim()}
                id="add-salt-btn"
              >
                <Plus size={16} />
                <span>Add Salt</span>
              </button>
            </form>

            {/* Quick Salt Suggestion Pills */}
            <div className="quick-salts-container">
              <span className="quick-salts-label">
                Quick Add Salt:
              </span>
              <div className="quick-salts-list">
                {COMMON_SALTS.map((salt) => {
                  const isAdded = ingredients.some((i) => i.name.toLowerCase() === salt.toLowerCase());
                  return (
                    <button
                      key={salt}
                      type="button"
                      className={`quick-salt-pill ${isAdded ? 'added' : ''}`}
                      onClick={() => !isAdded && handleAddIngredient(salt)}
                      disabled={isAdded}
                      title={isAdded ? `${salt} already added` : `Add ${salt}`}
                    >
                      {isAdded ? '✓ ' : '+ '}
                      {salt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dedicated Action Button to Find Matches - distinct & separated from Add Salt */}
            <div className="composition-search-footer">
              <button
                type="button"
                className="execute-composition-btn"
                onClick={() => onCompositionSearch(ingredients, true)}
                disabled={loading || ingredients.length === 0}
                id="find-exact-combinations-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    <span>Searching Combination...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>
                      {ingredients.length > 0
                        ? `Find Matching Medicines (${ingredients.length} ${ingredients.length === 1 ? 'Salt' : 'Salts'})`
                        : 'Add Salts to Find Matches'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
