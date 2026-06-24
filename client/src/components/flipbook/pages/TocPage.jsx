const ENTRIES = [
  'Property Overview',
  'Executive Summary',
  'Market Overview',
  'Financials',
  'Sales Comparables',
  'Rent Comparables',
  'Location & Amenities',
  'Drive Times & Points of Interest',
  'Offering Procedures',
  'Meet the Team',
];

export default function TocPage() {
  return (
    <div className="fp-page">
      <div className="fp-title">Table of Contents</div>
      <div className="fp-gold-rule" />
      <div className="fp-toc-list">
        {ENTRIES.map((label, i) => (
          <div className="fp-toc-row" key={label}>
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <span className="label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
