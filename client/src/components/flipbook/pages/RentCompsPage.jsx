import { formatNumber } from '../../../lib/format.js';

export default function RentCompsPage({ om }) {
  const comps = om.rentComps || [];

  return (
    <div className="fp-page">
      <div className="fp-title">Rent Comparables</div>
      <div className="fp-gold-rule" />
      <div className="fp-card-grid">
        {comps.map((c) => (
          <div className="fp-card" key={c.id}>
            <div className="fp-card-body">
              <div className="fp-card-title">{c.address || '—'}</div>
              <div className="fp-card-row">
                <span className="l">Tenant</span>
                <span className="v">{c.tenant || '—'}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Rent / SF</span>
                <span className="v">{c.rentPerSF || '—'}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Lease Term</span>
                <span className="v">{c.leaseTerm || '—'}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Square Feet</span>
                <span className="v">{c.squareFeet ? `${formatNumber(c.squareFeet)} SF` : '—'}</span>
              </div>
              <div className="fp-card-row">
                <span className="l">Lease Type</span>
                <span className="v">{c.leaseType || '—'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
