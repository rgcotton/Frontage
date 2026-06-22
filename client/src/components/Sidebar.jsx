export const SECTIONS = [
  { key: 'cover', label: 'Cover Page' },
  { key: 'overview', label: 'Property Overview' },
  { key: 'executiveSummary', label: 'Executive Summary' },
  { key: 'market', label: 'Market Overview' },
  { key: 'financials', label: 'Financials' },
  { key: 'salesComps', label: 'Sales Comps' },
  { key: 'rentComps', label: 'Rent Comps' },
  { key: 'team', label: 'About the Team' },
];

export default function Sidebar({ activeKey, onSelect, propertyName }) {
  return (
    <nav className="editor-sidebar">
      <div className="property-name">
        Editing
        <strong>{propertyName || 'Untitled Property'}</strong>
      </div>
      {SECTIONS.map((s, i) => (
        <button
          key={s.key}
          className={`nav-step ${s.key === activeKey ? 'active' : ''}`}
          onClick={() => onSelect(s.key)}
        >
          <span className="num">{i + 1}</span>
          {s.label}
        </button>
      ))}
    </nav>
  );
}
