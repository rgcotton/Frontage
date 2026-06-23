import { formatNumber, formatPercent, formatCurrency, filterStats } from '../../../lib/format.js';

export default function MarketPage({ om }) {
  const { market } = om;
  const demo = filterStats([
    ['Population', market.population, formatNumber],
    ['Median Income', market.medianIncome, formatCurrency],
    ['Daytime Population', market.daytimePopulation, formatNumber],
    ['Traffic Count', market.trafficCount, (v) => `${formatNumber(v)} VPD`],
  ]);
  const trends = filterStats([
    ['Submarket Vacancy', market.submarketVacancyRate, formatPercent],
    ['Asking Rents', market.askingRents, String],
    ['Absorption Trends', market.absorptionTrends, String],
  ]);

  return (
    <div className="fp-page">
      <div className="fp-title">Market Overview</div>
      {market.marketName && <div className="fp-subtitle">{market.marketName}</div>}
      <div className="fp-gold-rule" />
      {market.narrative && <p className="fp-narrative">{market.narrative}</p>}
      {demo.length > 0 && (
        <>
          <div className="fp-subhead">Demographics</div>
          <div className="stat-grid">
            {demo.map(([label, value]) => (
              <div className="stat-box" key={label}>
                <div className="label">{label}</div>
                <div className="value" style={{ fontSize: 15 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {trends.length > 0 && (
        <>
          <div className="fp-subhead">Submarket Trends</div>
          <div className="stat-grid">
            {trends.map(([label, value]) => (
              <div className="stat-box" key={label}>
                <div className="label">{label}</div>
                <div className="value" style={{ fontSize: 13 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
