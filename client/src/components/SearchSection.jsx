import React, { useState } from 'react';
import { Search, Camera, Sparkles, FlaskConical, Plus, X, Layers, CheckCircle2, Pill } from 'lucide-react';

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
  popularCompositions = [],
  activeMedicine,
  activeIngredients = []
}) {
  // Local state for composition builder
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientStrength, setIngredientStrength] = useState('');
  const [ingredients, setIngredients] = useState(() => {
    if (activeIngredients && activeIngredients.length > 0) {
      return activeIngredients.map((ing, idx) =>
        typeof ing === 'string'
          ? { id: idx, name: ing, strength: '' }
          : { id: idx, name: ing.name, strength: ing.strength || '' }
      );
    }
    return [
      { id: 1, name: 'Amoxicillin', strength: '500mg' },
      { id: 2, name: 'Clavulanic Acid', strength: '125mg' }
    ];
  });
  const [exactMatch, setExactMatch] = useState(true);

  // Submit name search
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  // Add new ingredient to tag tray
  const handleAddIngredient = (nameToAdd = ingredientName, strengthToAdd = ingredientStrength) => {
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
          name: cleanName,
          strength: (strengthToAdd || '').trim()
        }
      ]);
    }
    setIngredientName('');
    setIngredientStrength('');
  };

  // Remove an ingredient
  const handleRemoveIngredient = (idToRemove) => {
    setIngredients((prev) => prev.filter((i) => i.id !== idToRemove));
  };

  // Select a popular combination preset
  const handlePresetClick = (preset) => {
    const mapped = preset.ingredients.map((ing, idx) => ({
      id: Date.now() + idx,
      name: ing.name,
      strength: ing.strength || ''
    }));
    setIngredients(mapped);
    onCompositionSearch(preset.ingredients, exactMatch);
  };

  // Submit composition search
  const handleCompositionSubmit = (e) => {
    e.preventDefault();
    if (ingredientName.trim()) {
      handleAddIngredient();
      return;
    }
    if (ingredients.length > 0) {
      onCompositionSearch(ingredients, exactMatch);
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
            <span className="mode-tab-badge">Exact Match</span>
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
            <form onSubmit={handleNameSubmit} className="search-box-card">
              <Search size={20} color="var(--text-muted)" style={{ marginLeft: '0.5rem' }} />

              <input
                type="text"
                className="search-input-field"
                placeholder="Search medicine name or salt (e.g. Dolo 650, Telma 40, Augmentin 625)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                id="medicine-search-input"
              />

              <button
                type="button"
                className="scanner-cta-btn"
                onClick={onOpenScanner}
                title="Upload photo of your medicine strip or packaging"
                id="open-strip-scanner-btn"
              >
                <Camera size={16} color="#10b981" />
                <span>Scan Strip</span>
              </button>

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
                      onClick={() => {
                        setQuery(med.name);
                        onSearch(med.name);
                      }}
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
            <div className="composition-header">
              <div className="composition-header-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlaskConical size={18} color="#10b981" />
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>
                    Medicine Composition & Salt Matcher
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Add multiple active salts to find all medicines that match the exact combination.
                </p>
              </div>

              {/* Exact Match Toggle */}
              <label className="exact-match-toggle" title="Only return medicines that contain ALL specified ingredients">
                <input
                  type="checkbox"
                  checked={exactMatch}
                  onChange={(e) => setExactMatch(e.target.checked)}
                  id="exact-match-checkbox"
                />
                <span className="toggle-label">
                  <strong>Exact Combination Match</strong>
                  <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Must contain all salts
                  </small>
                </span>
              </label>
            </div>

            {/* Active Ingredients Tray */}
            <div className="ingredients-tray">
              <span className="tray-label">Active Formulation Ingredients ({ingredients.length}):</span>
              <div className="ingredient-chips-list">
                {ingredients.length === 0 ? (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                    No ingredients added. Type an active ingredient below or select a popular combination.
                  </span>
                ) : (
                  ingredients.map((ing) => (
                    <div key={ing.id} className="ingredient-chip-tag">
                      <span className="salt-name">{ing.name}</span>
                      {ing.strength && <span className="salt-strength">{ing.strength}</span>}
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

            {/* Input Row to Add More Salts */}
            <form onSubmit={handleCompositionSubmit} className="composition-input-row">
              <div className="input-group-salt">
                <input
                  type="text"
                  className="composition-text-input"
                  placeholder="e.g. Paracetamol, Metformin, Amoxicillin..."
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  id="composition-salt-input"
                />
              </div>

              <div className="input-group-strength">
                <input
                  type="text"
                  className="composition-text-input"
                  placeholder="Dosage (e.g. 500mg, 2mg)"
                  value={ingredientStrength}
                  onChange={(e) => setIngredientStrength(e.target.value)}
                  id="composition-strength-input"
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

              <button
                type="button"
                className="execute-composition-btn"
                onClick={() => onCompositionSearch(ingredients, exactMatch)}
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
                    <CheckCircle2 size={16} />
                    <span>Find Exact Matches</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Salt Suggestion Pills */}
            <div className="quick-salts-container">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
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
                    >
                      {isAdded ? '✓ ' : '+ '}
                      {salt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular Multi-Ingredient Combination Presets */}
            {popularCompositions && popularCompositions.length > 0 && (
              <div className="popular-presets-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Layers size={14} color="#10b981" />
                  <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Popular Multi-Ingredient Formulations in India:
                  </span>
                </div>
                <div className="presets-chips-grid">
                  {popularCompositions.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="preset-card-chip"
                      onClick={() => handlePresetClick(preset)}
                      title={`${preset.title} (${preset.category})`}
                    >
                      <span className="preset-title">{preset.title}</span>
                      <span className="preset-brand">e.g. {preset.referenceBrand}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Platform Connectivity Status */}
        <div className="platform-status-bar">
          <span style={{ fontWeight: 600 }}>8 Live Stores:</span>
          <span className="platform-pill">
            <span className="status-dot" /> Apollo (2-Hr Express)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> PharmEasy (Guaranteed)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Tata 1mg
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Netmeds
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Truemeds (Generics)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> PlatinumRx
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Zepto (10-Min)
          </span>
          <span className="platform-pill">
            <span className="status-dot" /> Amazon Pharmacy
          </span>
        </div>
      </div>
    </section>
  );
}
