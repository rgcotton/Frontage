import { formatNumber, formatPercent } from '../../../lib/format.js';

export default function OverviewPage({ om }) {
  const { overview, cover } = om;
  const isMultifamily = cover.propertyType === 'Multifamily';

  const stats = [
    ['Year Built', overview.yearBuilt || '—'],
    ['Square Footage', overview.squareFootage ? `${formatNumber(overview.squareFootage)} SF` : '—'],
    ['Lot Size', overview.lotSize || '—'],
  ];
  if (isMultifamily) stats.push(['Units', overview.units || '—']);
  stats.push(['Occupancy', overview.occupancyPct ? formatPercent(overview.occupancyPct) : '—']);
  stats.push(['Zoning', overview.zoning || '—']);
  stats.push(['Parking', overview.parking || '—']);

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
      <div className="stat-grid">
        {stats.map(([label, value]) => (
          <div className="stat-box" key={label}>
            <div className="label">{label}</div>
            <div className="value">{value}</div>
          </div>
        ))}
      </div>
      <p className="fp-narrative">{overview.description || 'No description provided.'}</p>
    </div>
  );
}
