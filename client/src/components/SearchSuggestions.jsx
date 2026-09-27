import React, { useEffect, useRef } from 'react';
import { Search, FlaskConical, TrendingUp } from 'lucide-react';

/**
 * SearchSuggestions — floating autocomplete dropdown.
 *
 * Props:
 *   suggestions  – array of { name, salt, category } objects
 *   visible      – boolean, whether to show the dropdown
 *   query        – current input string (used to highlight match)
 *   onSelect     – called with (item) when user picks a suggestion
 *   onClose      – called when the dropdown should hide (e.g. Escape)
 *   mode         – 'name' | 'composition' controls which icon to show
 */
export default function SearchSuggestions({ suggestions, visible, query, onSelect, onClose, mode = 'name' }) {
  const listRef = useRef(null);
  const focusedIdx = useRef(-1);

  // Reset focus tracking when dropdown reopens
  useEffect(() => {
    if (visible) focusedIdx.current = -1;
  }, [visible, suggestions]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e) => {
      if (!listRef.current) return;
      const items = listRef.current.querySelectorAll('[data-suggestion-item]');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedIdx.current = Math.min(focusedIdx.current + 1, items.length - 1);
        items[focusedIdx.current]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedIdx.current = Math.max(focusedIdx.current - 1, 0);
        items[focusedIdx.current]?.focus();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  if (!visible || !suggestions || suggestions.length === 0) return null;

  // Highlight the matching portion of the suggestion label
  function highlight(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="suggestion-highlight">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div className="suggestions-dropdown" role="listbox" aria-label="Search suggestions" ref={listRef}>
      <div className="suggestions-header">
        <span>Suggestions</span>
        <span className="suggestions-count">{suggestions.length} result{suggestions.length !== 1 ? 's' : ''}</span>
      </div>

      {suggestions.map((item, idx) => {
        const isSalt = item.category === 'Salt';
        return (
          <button
            key={`${item.name}-${idx}`}
            className="suggestion-item"
            data-suggestion-item
            role="option"
            tabIndex={0}
            onClick={() => onSelect(item)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
          >
            <div className="suggestion-icon-wrap" data-is-salt={isSalt}>
              {isSalt
                ? <FlaskConical size={15} />
                : <Search size={15} />
              }
            </div>

            <div className="suggestion-text">
              <span className="suggestion-name">
                {highlight(item.name, query)}
              </span>
              {!isSalt && (
                <span className="suggestion-salt">{item.salt}</span>
              )}
            </div>

            <span className="suggestion-category">{item.category}</span>
          </button>
        );
      })}

      <div className="suggestions-footer">
        <TrendingUp size={11} />
        <span>Press ↑↓ to navigate, Enter to select, Esc to close</span>
      </div>
    </div>
  );
}
