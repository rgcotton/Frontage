import { computeCompleteness, overallCompletenessPct } from '../lib/completeness.js';

export default function Sidebar({ activeKey, onSelect, propertyName, om, sections }) {
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

      {sections.map((s, i) => (
        <button key={s.key} className={`nav-step ${s.key === activeKey ? 'active' : ''}`} onClick={() => onSelect(s.key)}>
          <span className="num">{i + 1}</span>
          {s.label}
          <span className={`nav-check ${completion[s.key] ? 'done' : ''}`} />
        </button>
      ))}
    </nav>
  );
}
