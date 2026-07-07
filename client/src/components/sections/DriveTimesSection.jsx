import { useState } from 'react';
import { api } from '../../api.js';
import PlacesAutocomplete from '../inputs/PlacesAutocomplete.jsx';

let nextId = 1;
function makeId() {
  return `poi-${Date.now()}-${nextId++}`;
}

const CATEGORIES = ['Major Employer', 'Grocery Store', 'Hospital', 'Highway Access', 'School', 'Shopping Center', 'Airport', 'Other'];

const TYPE_TO_CATEGORY = [
  [['airport'], 'Airport'],
  [['hospital', 'health', 'doctor', 'pharmacy'], 'Hospital'],
  [['grocery_or_supermarket', 'supermarket'], 'Grocery Store'],
  [['school', 'university', 'primary_school', 'secondary_school'], 'School'],
  [['shopping_mall', 'department_store', 'clothing_store', 'home_goods_store', 'furniture_store', 'electronics_store', 'book_store'], 'Shopping Center'],
];
function inferCategory(types = []) {
  for (const [googleTypes, cat] of TYPE_TO_CATEGORY) {
    if (types.some((t) => googleTypes.includes(t))) return cat;
  }
  return 'Other';
}

export default function DriveTimesSection({ value, onChange, omId, om, onUpdateOm }) {
  const pois = value || [];
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);
  const propertyAddress = [om?.cover?.addressLine1, om?.cover?.city, om?.cover?.state].filter(Boolean).join(', ');

  function update(id, field, val) {
    onChange(pois.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  }

  function addPoi() {
    onChange([...pois, { id: makeId(), name: '', address: '', category: '', driveTimeMinutes: null }]);
  }

  function removePoi(id) {
    onChange(pois.filter((p) => p.id !== id));
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= pois.length) return;
    const next = [...pois];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  async function handleRecalculate(poisToRecalc = pois) {
    setRecalculating(true);
    setError(null);
    try {
      const updated = await api.recalculateDriveTimes(omId, poisToRecalc);
      onUpdateOm({ driveTimePois: updated.driveTimePois });
    } catch (err) {
      setError(err.message);
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div className="section-form">
      <h2>Drive Times &amp; Points of Interest</h2>
      <p className="section-hint">
        Add nearby places of interest -- drive times are calculated automatically from the property address
        {propertyAddress ? ` (${propertyAddress})` : ''} once both addresses are present.
      </p>

      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleRecalculate()} disabled={recalculating || !pois.length}>
        {recalculating ? 'Recalculating…' : '↻ Recalculate All Drive Times'}
      </button>
      {error && (
        <p className="field-hint" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}

      {pois.map((p, i) => (
        <div className="repeat-card" key={p.id}>
          <div className="repeat-card-header">
            <span>
              POI {i + 1}
              {typeof p.driveTimeMinutes === 'number' ? ` -- ${p.driveTimeMinutes} min drive` : ''}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === pois.length - 1} aria-label="Move down">
                ↓
              </button>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Name</label>
              <PlacesAutocomplete
                omId={omId}
                value={p.name}
                onChange={(val) => update(p.id, 'name', val)}
                onPlaceSelect={(place) => {
                  const next = pois.map((poi) =>
                    poi.id === p.id
                      ? {
                          ...poi,
                          name: place.name || poi.name,
                          address: place.formattedAddress || poi.address,
                          category: poi.category ? poi.category : inferCategory(place.types),
                        }
                      : poi
                  );
                  onChange(next);
                  handleRecalculate(next);
                }}
                onBlur={() => handleRecalculate()}
                placeholder="e.g. Walmart Supercenter"
              />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={p.category} onChange={(e) => update(p.id, 'category', e.target.value)}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Address</label>
            <input
              type="text"
              value={p.address}
              onChange={(e) => update(p.id, 'address', e.target.value)}
              onBlur={() => handleRecalculate()}
              placeholder="e.g. 123 Commerce Dr, Springfield, MO"
            />
          </div>
          <button type="button" className="btn-danger-text" onClick={() => removePoi(p.id)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addPoi}>
        + Add Point of Interest
      </button>
    </div>
  );
}
