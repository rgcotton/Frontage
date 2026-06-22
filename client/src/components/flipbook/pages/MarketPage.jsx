import { formatNumber, formatPercent, formatCurrency } from '../../../lib/format.js';

export default function MarketPage({ om }) {
  const { market } = om;
  const demo = [
    ['Population', market.population ? formatNumber(market.population) : '—'],
    ['Median Income', market.medianIncome ? formatCurrency(market.medianIncome) : '—'],
    ['Daytime Population', market.daytimePopulation ? formatNumber(market.daytimePopulation) : '—'],
    ['Traffic Count', market.trafficCount ? `${formatNumber(market.trafficCount)} VPD` : '—'],
  ];
  const trends = [
    ['Submarket Vacancy', market.submarketVacancyRate ? formatPercent(market.submarketVacancyRate) : '—'],
    ['Asking Rents', market.askingRents || '—'],
    ['Absorption Trends', market.absorptionTrends || '—'],
  ];

  return (
    <div className="fp-page">
      <div className="fp-title">Market Overview</div>
      {market.marketName && <div className="fp-subtitle">{market.marketName}</div>}
      <div className="fp-gold-rule" />
      <p className="fp-narrative">{market.narrative || 'No market narrative provided.'}</p>
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
    </div>
  );
}
