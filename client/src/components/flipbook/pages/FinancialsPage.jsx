import { formatCurrency, formatPercent } from '../../../lib/format.js';

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

  return (
    <div className="fp-page">
      <div className="fp-title">Financials</div>
      <div className="fp-gold-rule" />
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-box">
          <div className="label">Asking Price</div>
          <div className="value">{formatCurrency(executiveSummary.offeringPrice)}</div>
        </div>
        <div className="stat-box">
          <div className="label">NOI</div>
          <div className="value">{formatCurrency(executiveSummary.noi)}</div>
        </div>
        <div className="stat-box">
          <div className="label">Cap Rate</div>
          <div className="value">{formatPercent(executiveSummary.capRate)}</div>
        </div>
        <div className="stat-box">
          <div className="label">Gross Income</div>
          <div className="value">{formatCurrency(financials.grossIncome)}</div>
        </div>
        <div className="stat-box">
          <div className="label">Operating Expenses</div>
          <div className="value">{formatCurrency(financials.operatingExpenses)}</div>
        </div>
      </div>

      <div className="fp-subhead" style={{ marginTop: 0 }}>
        Trailing 12-Month Income &amp; Expenses (T12)
      </div>
      {lineItems.length > 0 ? (
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
      ) : (
        <p className="fp-narrative">No T12 line items provided.</p>
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
          <div className="stat-grid" style={{ marginBottom: 12 }}>
            <div className="stat-box">
              <div className="label">Rent Growth</div>
              <div className="value" style={{ fontSize: 13 }}>
                {a.rentGrowthPct ? formatPercent(a.rentGrowthPct) : '—'}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Expense Growth</div>
              <div className="value" style={{ fontSize: 13 }}>
                {a.expenseGrowthPct ? formatPercent(a.expenseGrowthPct) : '—'}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Vacancy</div>
              <div className="value" style={{ fontSize: 13 }}>
                {a.vacancyPct ? formatPercent(a.vacancyPct) : '—'}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Hold Period</div>
              <div className="value" style={{ fontSize: 13 }}>
                {a.holdPeriodYears ? `${a.holdPeriodYears} yrs` : '—'}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Exit Cap Rate</div>
              <div className="value" style={{ fontSize: 13 }}>
                {a.exitCapRate ? formatPercent(a.exitCapRate) : '—'}
              </div>
            </div>
          </div>
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
