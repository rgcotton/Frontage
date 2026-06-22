import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <div className="label">{label}</div>
      <div className="value">{value || '—'}</div>
    </div>
  );
}

export default function SharePage() {
  const { id } = useParams();
  const [om, setOm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getOm(id).then(setOm).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="center-page">This offering memorandum could not be found.</div>;
  if (!om) return <div className="center-page">Loading…</div>;

  const { cover, overview, executiveSummary, market, financials, salesComps, rentComps, team } = om;
  const addressLine = [cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip].filter(Boolean).join(' • ');

  return (
    <div className="brochure">
      <div
        className="brochure-cover"
        style={cover.coverPhoto ? { backgroundImage: `url(${cover.coverPhoto.url})` } : undefined}
      >
        <div className="eyebrow">OFFERING MEMORANDUM</div>
        <h1>{cover.propertyName || 'Untitled Property'}</h1>
        <div className="address">{addressLine}</div>
        {cover.tagline && <div className="address" style={{ marginTop: 6, opacity: 0.85 }}>{cover.tagline}</div>}
      </div>

      <section className="brochure-section">
        <h2>Property Overview</h2>
        <div className="stat-grid">
          <Stat label="Year Built" value={overview.yearBuilt} />
          <Stat label="Square Footage" value={overview.squareFootage} />
          <Stat label="Lot Size" value={overview.lotSize} />
          <Stat label="Units" value={overview.units} />
          <Stat label="Zoning" value={overview.zoning} />
          <Stat label="Parking" value={overview.parking} />
        </div>
        <p>{overview.description}</p>
        {overview.photos?.length > 0 && (
          <div className="brochure-photos">
            {overview.photos
              .filter((p) => p.mimetype.startsWith('image/'))
              .map((p) => (
                <img key={p.id} src={p.url} alt="" />
              ))}
          </div>
        )}
      </section>

      <section className="brochure-section">
        <h2>Executive Summary</h2>
        <div className="stat-grid">
          <Stat label="Offering Price" value={executiveSummary.offeringPrice} />
          <Stat label="Cap Rate" value={executiveSummary.capRate} />
          <Stat label="NOI" value={executiveSummary.noi} />
        </div>
        <p>{executiveSummary.narrative}</p>
        {executiveSummary.highlights?.length > 0 && (
          <ul>
            {executiveSummary.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="brochure-section">
        <h2>Market Overview</h2>
        {market.marketName && <h3 style={{ marginBottom: 8 }}>{market.marketName}</h3>}
        <p>{market.narrative}</p>
        {market.demographics && <p>{market.demographics}</p>}
        {market.images?.length > 0 && (
          <div className="brochure-photos">
            {market.images
              .filter((p) => p.mimetype.startsWith('image/'))
              .map((p) => (
                <img key={p.id} src={p.url} alt="" />
              ))}
          </div>
        )}
      </section>

      <section className="brochure-section">
        <h2>Financial Summary</h2>
        <div className="stat-grid">
          <Stat label="Asking Price" value={financials.askingPrice} />
          <Stat label="NOI" value={financials.noi} />
          <Stat label="Cap Rate" value={financials.capRate} />
          <Stat label="Gross Income" value={financials.grossIncome} />
          <Stat label="Operating Expenses" value={financials.operatingExpenses} />
        </div>
        {financials.lineItems?.length > 0 && (
          <table className="brochure-table">
            <thead>
              <tr>
                <th>Line Item</th>
                <th>Income</th>
                <th>Expense</th>
              </tr>
            </thead>
            <tbody>
              {financials.lineItems.map((li) => (
                <tr key={li.id}>
                  <td>{li.label}</td>
                  <td>{li.income}</td>
                  <td>{li.expense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {salesComps?.length > 0 && (
        <section className="brochure-section">
          <h2>Sales Comparables</h2>
          <table className="brochure-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Sale Date</th>
                <th>Sale Price</th>
                <th>Price/SF</th>
                <th>Cap Rate</th>
              </tr>
            </thead>
            <tbody>
              {salesComps.map((c) => (
                <tr key={c.id}>
                  <td>{c.address}</td>
                  <td>{c.saleDate}</td>
                  <td>{c.salePrice}</td>
                  <td>{c.pricePerSF}</td>
                  <td>{c.capRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {rentComps?.length > 0 && (
        <section className="brochure-section">
          <h2>Rent Comparables</h2>
          <table className="brochure-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Tenant</th>
                <th>Rent/SF</th>
                <th>Lease Term</th>
                <th>Sq Ft</th>
              </tr>
            </thead>
            <tbody>
              {rentComps.map((c) => (
                <tr key={c.id}>
                  <td>{c.address}</td>
                  <td>{c.tenant}</td>
                  <td>{c.rentPerSF}</td>
                  <td>{c.leaseTerm}</td>
                  <td>{c.squareFeet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {team?.length > 0 && (
        <section className="brochure-section">
          <h2>About the Team</h2>
          {team.map((m) => (
            <div className="team-member" key={m.id}>
              {m.headshot && <img src={m.headshot.url} alt={m.name} />}
              <div>
                <div className="name">{m.name}</div>
                <div className="title">{m.title}</div>
                <div>{[m.phone, m.email].filter(Boolean).join('  •  ')}</div>
                {m.bio && <p>{m.bio}</p>}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
