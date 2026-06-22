import { formatCurrency, formatPercent } from '../../../lib/format.js';

export default function ExecutiveSummaryPage({ om }) {
  const { executiveSummary } = om;
  const highlights = (executiveSummary.highlights || []).filter(Boolean);

  return (
    <div className="fp-page">
      <div className="fp-title">Executive Summary</div>
      <div className="fp-gold-rule" />
      <div className="fp-two-col">
        <div className="fp-col-stats">
          <div className="fp-big-stat">
            <span className="l">Offering Price</span>
            <span className="v">{formatCurrency(executiveSummary.offeringPrice)}</span>
          </div>
          <div className="fp-big-stat">
            <span className="l">Cap Rate</span>
            <span className="v">{formatPercent(executiveSummary.capRate)}</span>
          </div>
          <div className="fp-big-stat">
            <span className="l">NOI</span>
            <span className="v">{formatCurrency(executiveSummary.noi)}</span>
          </div>
        </div>
        <div className="fp-col-body">
          <p className="fp-narrative">{executiveSummary.narrative || 'No summary provided.'}</p>
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
