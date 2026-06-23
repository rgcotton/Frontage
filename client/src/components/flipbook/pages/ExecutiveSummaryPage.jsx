import { formatCurrency, formatPercent, filterStats } from '../../../lib/format.js';

export default function ExecutiveSummaryPage({ om }) {
  const { executiveSummary } = om;
  const highlights = (executiveSummary.highlights || []).filter(Boolean);
  const stats = filterStats([
    ['Offering Price', executiveSummary.offeringPrice, formatCurrency],
    ['Cap Rate', executiveSummary.capRate, formatPercent],
    ['NOI', executiveSummary.noi, formatCurrency],
  ]);

  return (
    <div className="fp-page">
      <div className="fp-title">Executive Summary</div>
      <div className="fp-gold-rule" />
      <div className="fp-two-col">
        <div className="fp-col-stats">
          {stats.map(([label, value]) => (
            <div className="fp-big-stat" key={label}>
              <span className="l">{label}</span>
              <span className="v">{value}</span>
            </div>
          ))}
        </div>
        <div className="fp-col-body">
          {executiveSummary.narrative && <p className="fp-narrative">{executiveSummary.narrative}</p>}
          {highlights.length > 0 && (
            <>
              <div className="fp-subhead">Investment Highlights</div>
              <ul className="bullet-list">
                {highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
