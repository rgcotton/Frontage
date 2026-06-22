import { formatCurrency, formatPercent, formatMonthYear, formatNumber } from '../../../lib/format.js';

export default function SalesCompsPage({ om }) {
  const comps = om.salesComps || [];

  return (
    <div className="fp-page">
      <div className="fp-title">Sales Comparables</div>
      <div className="fp-gold-rule" />
      <div className="fp-card-grid">
        {comps.map((c) => (
          <div className="fp-card" key={c.id}>
            {c.photo && c.photo.mimetype?.startsWith('image/') && <img className="fp-card-photo" src={c.photo.url} alt="" />}
            <div className="fp-card-body">
              <div className="fp-card-title">{c.address || '—'}</div>
              <div className="fp-card-row">
                <span className="l">Sale Date</span>
                <span className="v">{formatMonthYear(c.saleDate)}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Sale Price</span>
                <span className="v">{formatCurrency(c.salePrice)}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Price / SF</span>
                <span className="v">{formatCurrency(c.pricePerSF)}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Cap Rate</span>
                <span className="v">{formatPercent(c.capRate)}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Square Feet</span>
                <span className="v">{c.squareFeet ? `${formatNumber(c.squareFeet)} SF` : '—'}</span>
              </div>
              {c.notes && <div className="fp-card-notes">{c.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
