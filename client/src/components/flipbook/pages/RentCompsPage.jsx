import { formatNumber, filterStats } from '../../../lib/format.js';

export default function RentCompsPage({ om }) {
  const comps = om.rentComps || [];

  return (
    <div className="fp-page">
      <div className="fp-title">Rent Comparables</div>
      <div className="fp-gold-rule" />
      <div className="fp-card-grid">
        {comps.map((c) => {
          const rows = filterStats([
            ['Tenant', c.tenant, String],
            ['Rent / SF', c.rentPerSF, String],
            ['Lease Term', c.leaseTerm, String],
            ['Square Feet', c.squareFeet, (v) => `${formatNumber(v)} SF`],
            ['Lease Type', c.leaseType, String],
          ]);
          return (
            <div className="fp-card" key={c.id}>
              <div className="fp-card-body">
                {c.address && <div className="fp-card-title">{c.address}</div>}
                {rows.map(([label, value]) => (
                  <div className="fp-card-row" key={label}>
                    <span className="l">{label}</span>
                    <span className="v">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
