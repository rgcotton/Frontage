import { useEffect, useRef, useState } from 'react';
import { api } from '../../api.js';

export default function PlacesAutocomplete({ value, onChange, onPlaceSelect, omId, placeholder, onBlur }) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [keyMissing, setKeyMissing] = useState(false);

  const wrapperRef = useRef(null);
  const timerRef = useRef(null);

  // Click-outside: clear suggestions when user clicks away
  useEffect(() => {
    function handleMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function handleChange(e) {
    const text = e.target.value;
    onChange(text);

    clearTimeout(timerRef.current);

    if (text.length < 3) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const results = await api.searchPlaces(omId, text);
        setSuggestions(results || []);
        setActiveIndex(-1);
      } catch (err) {
        if (err.message && err.message.includes('GOOGLE_MAPS_API_KEY')) {
          setKeyMissing(true);
        }
        setSuggestions([]);
        setActiveIndex(-1);
      }
    }, 300);
  }

  async function selectSuggestion(suggestion) {
    onChange(suggestion.description);
    setSuggestions([]);
    setActiveIndex(-1);

    try {
      const result = await api.getPlaceDetails(omId, suggestion.placeId);
      if (result) {
        onPlaceSelect(result);
      }
    } catch {
      // address text already set; swallow error silently
    }
  }

  function handleKeyDown(e) {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
      />

      {suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            listStyle: 'none',
            margin: '4px 0 0',
            padding: '4px 0',
            zIndex: 100,
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              onMouseDown={() => selectSuggestion(s)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                background: i === activeIndex ? 'var(--hover-bg)' : '#fff',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{s.mainText}</span>
              {s.secondaryText && (
                <span style={{ color: 'var(--muted)', fontSize: '12px', marginLeft: '6px' }}>{s.secondaryText}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {keyMissing && (
        <p className="field-hint">Autocomplete unavailable — add GOOGLE_MAPS_API_KEY to server/.env</p>
      )}
    </div>
  );
}
