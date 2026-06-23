import { formatCurrency, formatPercent, formatNumber, filterStats } from '../../../lib/format.js';

export default function CoverPage({ om }) {
  const { cover, executiveSummary, overview } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(' • ');
  const stats = filterStats([
    ['Offering Price', executiveSummary.offeringPrice, formatCurrency],
    ['Cap Rate', executiveSummary.capRate, formatPercent],
    ['NOI', executiveSummary.noi, formatCurrency],
    ['Square Footage', overview.squareFootage, (v) => `${formatNumber(v)} SF`],
  ]);

  return (
    <div className="fp-cover" style={cover.coverPhoto ? { backgroundImage: `url(${cover.coverPhoto.url})` } : undefined}>
      <div className="fp-cover-overlay">
        <div className="fp-eyebrow">Offering Memorandum</div>
        {cover.propertyType && <div className="fp-cover-type">{cover.propertyType}</div>}
        <h1>{cover.propertyName || 'Untitled Property'}</h1>
        <div className="fp-cover-address">{addressLine}</div>
        {cover.tagline && <div className="fp-cover-tagline">{cover.tagline}</div>}
        {stats.length > 0 && (
          <div className="fp-cover-stats">
            {stats.map(([label, value]) => (
              <div key={label}>
                <span className="l">{label}</span>
                <span className="v">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
