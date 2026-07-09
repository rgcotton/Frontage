import { formatCurrency, formatPercent, formatNumber, filterStats } from '../../../lib/format.js';

export default function OnePagerPage({ om }) {
  const { cover = {}, executiveSummary = {}, overview = {}, team = [], driveTimePois = [] } = om;

  const addressLine = [
    cover.formattedAddress || cover.addressLine1,
    [cover.city, cover.state].filter(Boolean).join(', '),
    cover.zip,
  ]
    .filter(Boolean)
    .join(' • ');

  const stats = filterStats([
    ['Price', executiveSummary.offeringPrice, formatCurrency],
    ['Cap Rate', executiveSummary.capRate, formatPercent],
    ['NOI', executiveSummary.noi, formatCurrency],
    ['Sq Ft', overview.squareFootage, (v) => `${formatNumber(v)} SF`],
    ['Occupancy', overview.occupancyPct, formatPercent],
  ]);

  const allHighlights = cover.onePagerHighlights
    ? cover.onePagerHighlights.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 4)
    : (executiveSummary.highlights || []).filter(Boolean).slice(0, 4);

  const pois = driveTimePois.slice(0, 4);
  const primary = team[0];
  const hasPhoto = Boolean(cover.coverPhoto?.url);

  return (
    <div className="fp-onepager">
      <div
        className="fp-onepager-hero"
        style={hasPhoto ? { backgroundImage: `url(${cover.coverPhoto.url})` } : undefined}
      >
        <div className="fp-onepager-hero-overlay">
          {cover.propertyType && <div className="fp-eyebrow">{cover.propertyType}</div>}
          <h1 className="fp-onepager-title">{cover.propertyName || 'Untitled Property'}</h1>
          {addressLine && <div className="fp-onepager-address">{addressLine}</div>}
          {cover.tagline && <div className="fp-onepager-tagline">{cover.tagline}</div>}
        </div>
      </div>

      {stats.length > 0 && (
        <div className="fp-onepager-stats">
          {stats.map(([label, value]) => (
            <div key={label} className="fp-onepager-stat">
              <span className="l">{label}</span>
              <span className="v">{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="fp-onepager-body">
        <div className="fp-onepager-left">
          {allHighlights.length > 0 && (
            <div className="fp-onepager-card">
              <div className="fp-subhead">Investment Highlights</div>
              <ul className="bullet-list">
                {allHighlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          )}
          {cover.onePagerDealSummary && (
            <div className="fp-onepager-card">
              <div className="fp-subhead">Deal Summary</div>
              <p className="fp-narrative">{cover.onePagerDealSummary}</p>
            </div>
          )}
          {pois.length > 0 && (
            <div className="fp-onepager-card">
              <div className="fp-subhead">Drive Times</div>
              {pois.map((p, i) => (
                <div key={i} className="fp-onepager-poi">
                  <span>{p.name}</span>
                  {typeof p.driveTimeMinutes === 'number' && (
                    <span className="fp-onepager-poi-time">{p.driveTimeMinutes} min</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="fp-onepager-right">
          {primary?.name && <div className="fp-onepager-broker-name">{primary.name}</div>}
          {primary?.title && <div className="fp-onepager-broker-title">{primary.title}</div>}
          {primary?.phone && <div className="fp-onepager-broker-contact">{primary.phone}</div>}
          {primary?.email && <div className="fp-onepager-broker-contact">{primary.email}</div>}
          {cover.brokerageName && (
            <div className="fp-onepager-brokerage">{cover.brokerageName}</div>
          )}
        </div>
      </div>
    </div>
  );
}
