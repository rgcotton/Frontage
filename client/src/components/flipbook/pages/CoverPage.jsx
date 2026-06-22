import { formatCurrency, formatPercent, formatNumber } from '../../../lib/format.js';

export default function CoverPage({ om }) {
  const { cover, executiveSummary, overview } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="fp-cover" style={cover.coverPhoto ? { backgroundImage: `url(${cover.coverPhoto.url})` } : undefined}>
      <div className="fp-cover-overlay">
        <div className="fp-eyebrow">Offering Memorandum</div>
        {cover.propertyType && <div className="fp-cover-type">{cover.propertyType}</div>}
        <h1>{cover.propertyName || 'Untitled Property'}</h1>
        <div className="fp-cover-address">{addressLine}</div>
        {cover.tagline && <div className="fp-cover-tagline">{cover.tagline}</div>}
        <div className="fp-cover-stats">
          <div>
            <span className="l">Offering Price</span>
            <span className="v">{formatCurrency(executiveSummary.offeringPrice)}</span>
          </div>
          <div>
            <span className="l">Cap Rate</span>
            <span className="v">{formatPercent(executiveSummary.capRate)}</span>
          </div>
          <div>
            <span className="l">NOI</span>
            <span className="v">{formatCurrency(executiveSummary.noi)}</span>
          </div>
          <div>
            <span className="l">Square Footage</span>
            <span className="v">{overview.squareFootage ? `${formatNumber(overview.squareFootage)} SF` : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
