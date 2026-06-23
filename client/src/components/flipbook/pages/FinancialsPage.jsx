import { formatCurrency, formatPercent, filterStats } from '../../../lib/format.js';

function num(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
}

export default function FinancialsPage({ om }) {
  const { financials, executiveSummary } = om;
  const lineItems = financials.lineItems || [];
  const totalIncome = lineItems.reduce((s, li) => s + num(li.income), 0);
  const totalExpense = lineItems.reduce((s, li) => s + num(li.expense), 0);
  const rentRoll = financials.rentRoll || [];
  const cashFlows = financials.proForma?.cashFlows || [];
  const a = financials.proForma?.assumptions || {};
  const hasAssumptions = Object.values(a).some(Boolean);
  const summaryStats = filterStats([
    ['Asking Price', executiveSummary.offeringPrice, formatCurrency],
    ['NOI', executiveSummary.noi, formatCurrency],
    ['Cap Rate', executiveSummary.capRate, formatPercent],
    ['Gross Income', financials.grossIncome, formatCurrency],
    ['Operating Expenses', financials.operatingExpenses, formatCurrency],
  ]);
  const assumptionStats = filterStats([
    ['Rent Growth', a.rentGrowthPct, formatPercent],
    ['Expense Growth', a.expenseGrowthPct, formatPercent],
    ['Vacancy', a.vacancyPct, formatPercent],
    ['Hold Period', a.holdPeriodYears, (v) => `${v} yrs`],
    ['Exit Cap Rate', a.exitCapRate, formatPercent],
  ]);

  return (
    <div className="fp-page">
      <div className="fp-title">Financials</div>
      <div className="fp-gold-rule" />
      {summaryStats.length > 0 && (
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          {summaryStats.map(([label, value]) => (
            <div className="stat-box" key={label}>
              <div className="label">{label}</div>
              <div className="value">{value}</div>
            </div>
          ))}
        </div>
      )}

      {lineItems.length > 0 && (
        <>
          <div className="fp-subhead" style={{ marginTop: 0 }}>
            Trailing 12-Month Income &amp; Expenses (T12)
          </div>
          <table className="brochure-table">
            <thead>
              <tr>
                <th>Line Item</th>
                <th>Income</th>
                <th>Expense</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li) => (
                <tr key={li.id}>
                  <td>{li.label}</td>
                  <td>{formatCurrency(li.income)}</td>
                  <td>{formatCurrency(li.expense)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td>Total</td>
                <td>{formatCurrency(totalIncome)}</td>
                <td>{formatCurrency(totalExpense)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {rentRoll.length > 0 && (
        <>
          <div className="fp-subhead">Rent Roll</div>
          <table className="brochure-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Suite</th>
                <th>SF</th>
                <th>Monthly Rent</th>
                <th>Annual Rent</th>
                <th>Lease Type</th>
              </tr>
            </thead>
            <tbody>
              {rentRoll.map((r) => (
                <tr key={r.id}>
                  <td>{r.tenantName}</td>
                  <td>{r.suite}</td>
                  <td>{r.sf}</td>
                  <td>{formatCurrency(r.monthlyRent)}</td>
                  <td>{formatCurrency(r.annualRent)}</td>
                  <td>{r.leaseType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {(cashFlows.length > 0 || hasAssumptions) && (
        <>
          <div className="fp-subhead">Pro Forma</div>
          {assumptionStats.length > 0 && (
            <div className="stat-grid" style={{ marginBottom: 12 }}>
              {assumptionStats.map(([label, value]) => (
                <div className="stat-box" key={label}>
                  <div className="label">{label}</div>
                  <div className="value" style={{ fontSize: 13 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
          {cashFlows.length > 0 && (
            <table className="brochure-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Gross Income</th>
                  <th>Vacancy Loss</th>
                  <th>Op. Expenses</th>
                  <th>NOI</th>
                  <th>Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {cashFlows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.year}</td>
                    <td>{formatCurrency(r.grossIncome)}</td>
                    <td>{formatCurrency(r.vacancyLoss)}</td>
                    <td>{formatCurrency(r.operatingExpenses)}</td>
                    <td>{formatCurrency(r.noi)}</td>
                    <td>{formatCurrency(r.cashFlow)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
