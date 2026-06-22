import { computeCompleteness, overallCompletenessPct } from '../lib/completeness.js';

export const SECTIONS = [
  { key: 'cover', label: 'Cover Page' },
  { key: 'overview', label: 'Property Overview' },
  { key: 'executiveSummary', label: 'Executive Summary' },
  { key: 'market', label: 'Market Overview' },
  { key: 'financials', label: 'Financials' },
  { key: 'salesComps', label: 'Sales Comps' },
  { key: 'rentComps', label: 'Rent Comps' },
  { key: 'locationMap', label: 'Location & Amenities' },
  { key: 'offeringProcedures', label: 'Offering Procedures' },
  { key: 'team', label: 'About the Team' },
];

export default function Sidebar({ activeKey, onSelect, propertyName, om }) {
  const completion = om ? computeCompleteness(om) : {};
  const pct = om ? overallCompletenessPct(om) : 0;

  return (
    <nav className="editor-sidebar">
      <div className="property-name">
        Editing
        <strong>{propertyName || 'Untitled Property'}</strong>
      </div>

      <div className="progress-block">
        <div className="progress-label">
          <span>OM Completeness</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {SECTIONS.map((s, i) => (
        <button key={s.key} className={`nav-step ${s.key === activeKey ? 'active' : ''}`} onClick={() => onSelect(s.key)}>
          <span className="num">{i + 1}</span>
          {s.label}
          <span className={`nav-check ${completion[s.key] ? 'done' : ''}`} />
        </button>
      ))}
    </nav>
  );
}
