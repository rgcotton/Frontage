import { formatNumber, formatPercent, filterStats } from '../../../lib/format.js';

export default function OverviewPage({ om }) {
  const { overview, cover } = om;
  const isMultifamily = cover.propertyType === 'Multifamily';

  const rawStats = [
    ['Year Built', overview.yearBuilt, String],
    ['Square Footage', overview.squareFootage, (v) => `${formatNumber(v)} SF`],
    ['Lot Size', overview.lotSize, String],
  ];
  if (isMultifamily) rawStats.push(['Units', overview.units, String]);
  rawStats.push(['Occupancy', overview.occupancyPct, formatPercent]);
  rawStats.push(['Zoning', overview.zoning, String]);
  rawStats.push(['Parking', overview.parking, String]);
  rawStats.push(['Lease Type', overview.leaseType, String]);
  const stats = filterStats(rawStats);

  const photos = (overview.photos || []).filter((p) => p.mimetype?.startsWith('image/')).slice(0, 4);

  return (
    <div className="fp-page">
      <div className="fp-title">Property Overview</div>
      <div className="fp-gold-rule" />
      {photos.length > 0 && (
        <div className="brochure-photos" style={{ marginBottom: 14 }}>
          {photos.map((p) => (
            <img key={p.id} src={p.url} alt="" />
          ))}
        </div>
      )}
      {stats.length > 0 && (
        <div className="stat-grid">
          {stats.map(([label, value]) => (
            <div className="stat-box" key={label}>
              <div className="label">{label}</div>
              <div className="value">{value}</div>
            </div>
          ))}
        </div>
      )}
      {overview.description && <p className="fp-narrative">{overview.description}</p>}
    </div>
  );
}
