import { formatCurrency, formatPercent, formatMonthYear, formatNumber, filterStats } from '../../../lib/format.js';

export default function SalesCompsPage({ om }) {
  const comps = om.salesComps || [];

  return (
    <div className="fp-page">
      <div className="fp-title">Sales Comparables</div>
      <div className="fp-gold-rule" />
      <div className="fp-card-grid">
        {comps.map((c) => {
          const rows = filterStats([
            ['Sale Date', c.saleDate, formatMonthYear],
            ['Sale Price', c.salePrice, formatCurrency],
            ['Price / SF', c.pricePerSF, formatCurrency],
            ['Cap Rate', c.capRate, formatPercent],
            ['Square Feet', c.squareFeet, (v) => `${formatNumber(v)} SF`],
          ]);
          return (
            <div className="fp-card" key={c.id}>
              {c.photo && c.photo.mimetype?.startsWith('image/') && <img className="fp-card-photo" src={c.photo.url} alt="" />}
              <div className="fp-card-body">
                {c.address && <div className="fp-card-title">{c.address}</div>}
                {rows.map(([label, value]) => (
                  <div className="fp-card-row" key={label}>
                    <span className="l">{label}</span>
                    <span className="v">{value}</span>
                  </div>
                ))}
                {c.notes && <div className="fp-card-notes">{c.notes}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
