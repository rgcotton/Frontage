import { pageShell, headerBar } from './layout.js';
import { formatCurrency, formatPercent, escOrDash, filterStats } from '../helpers/format.js';

const T12_FIRST_CAP = 14;
const T12_REST_CAP = 22;
const ROLL_FIRST_CAP = 16;
const ROLL_REST_CAP = 22;
const CASHFLOW_FIRST_CAP = 10;
const CASHFLOW_REST_CAP = 20;

function numeric(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
}

function chunk(items, firstCap, restCap) {
  const chunks = [];
  let i = 0;
  let first = true;
  while (i < items.length) {
    const cap = first ? firstCap : restCap;
    chunks.push(items.slice(i, i + cap));
    i += cap;
    first = false;
  }
  if (!chunks.length) chunks.push([]);
  return chunks;
}

export function buildPages(om, ctx) {
  const { financials, executiveSummary, cover } = om;
  const pages = [];

  // --- Financial Summary + T12 ---
  const lineItems = financials.lineItems || [];
  const totalIncome = lineItems.reduce((s, li) => s + numeric(li.income), 0);
  const totalExpense = lineItems.reduce((s, li) => s + numeric(li.expense), 0);
  const t12Chunks = chunk(lineItems, T12_FIRST_CAP, T12_REST_CAP);

  t12Chunks.forEach((rows, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === t12Chunks.length - 1;
    const summaryStatRows = filterStats([
      ['Asking Price', executiveSummary.offeringPrice, formatCurrency],
      ['NOI', executiveSummary.noi, formatCurrency],
      ['Cap Rate', executiveSummary.capRate, formatPercent],
      ['Gross Income', financials.grossIncome, formatCurrency],
      ['Operating Expenses', financials.operatingExpenses, formatCurrency],
    ]);
    const summaryStats =
      isFirst && summaryStatRows.length
        ? `<div class="stat-grid" style="--cols:${summaryStatRows.length}; margin-bottom:18px;">
        ${summaryStatRows.map(([label, value]) => `<div class="stat-box"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('')}
      </div>`
        : '';
    const tableRows = rows
      .map((li) => `<tr><td>${escOrDash(li.label)}</td><td>${formatCurrency(li.income)}</td><td>${formatCurrency(li.expense)}</td></tr>`)
      .join('');
    const totalRow =
      isLast && lineItems.length
        ? `<tr class="total-row"><td>Total</td><td>${formatCurrency(totalIncome)}</td><td>${formatCurrency(totalExpense)}</td></tr>`
        : '';
    const inner = `
      ${headerBar(cover.propertyName, 'Financials', !isFirst)}
      <div class="section-title">Financial Summary</div>
      <div class="gold-rule"></div>
      ${summaryStats}
      ${
        lineItems.length
          ? `<div class="subhead" style="margin-top:0;">Trailing 12-Month Income &amp; Expenses (T12)</div>
      <table class="pdf-table">
        <thead><tr><th>Line Item</th><th>Income</th><th>Expense</th></tr></thead>
        <tbody>${tableRows}${totalRow}</tbody>
      </table>`
          : ''
      }
    `;
    pages.push(pageShell(inner));
  });

  // --- Rent Roll ---
  const rentRoll = financials.rentRoll || [];
  if (rentRoll.length) {
    const totalMonthly = rentRoll.reduce((s, r) => s + numeric(r.monthlyRent), 0);
    const totalAnnual = rentRoll.reduce((s, r) => s + numeric(r.annualRent), 0);
    const rollChunks = chunk(rentRoll, ROLL_FIRST_CAP, ROLL_REST_CAP);
    rollChunks.forEach((rows, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === rollChunks.length - 1;
      const tableRows = rows
        .map(
          (r) => `<tr>
        <td>${escOrDash(r.tenantName)}</td><td>${escOrDash(r.suite)}</td><td>${escOrDash(r.sf)}</td>
        <td>${escOrDash(r.leaseStart)}</td><td>${escOrDash(r.leaseEnd)}</td>
        <td>${formatCurrency(r.monthlyRent)}</td><td>${formatCurrency(r.annualRent)}</td><td>${escOrDash(r.leaseType)}</td>
      </tr>`
        )
        .join('');
      const totalRow = isLast
        ? `<tr class="total-row"><td colspan="5">Total</td><td>${formatCurrency(totalMonthly)}</td><td>${formatCurrency(totalAnnual)}</td><td></td></tr>`
        : '';
      const inner = `
        ${headerBar(cover.propertyName, 'Rent Roll', !isFirst)}
        <div class="section-title">Rent Roll</div>
        <div class="gold-rule"></div>
        <table class="pdf-table">
          <thead><tr><th>Tenant</th><th>Suite</th><th>SF</th><th>Lease Start</th><th>Lease End</th><th>Monthly Rent</th><th>Annual Rent</th><th>Lease Type</th></tr></thead>
          <tbody>${tableRows}${totalRow}</tbody>
        </table>
      `;
      pages.push(pageShell(inner));
    });
  }

  // --- Pro Forma ---
  const cashFlows = financials.proForma?.cashFlows || [];
  const a = financials.proForma?.assumptions || {};
  const hasAssumptions = Object.values(a).some(Boolean);
  if (hasAssumptions || cashFlows.length) {
    const cfChunks = chunk(cashFlows, CASHFLOW_FIRST_CAP, CASHFLOW_REST_CAP);
    cfChunks.forEach((rows, idx) => {
      const isFirst = idx === 0;
      const assumptionRows = filterStats([
        ['Rent Growth', a.rentGrowthPct, formatPercent],
        ['Expense Growth', a.expenseGrowthPct, formatPercent],
        ['Vacancy', a.vacancyPct, formatPercent],
        ['Hold Period', a.holdPeriodYears, (v) => `${v} yrs`],
        ['Exit Cap Rate', a.exitCapRate, formatPercent],
      ]);
      const assumptionsBlock =
        isFirst && assumptionRows.length
          ? `<div class="subhead" style="margin-top:0;">Cash Flow Assumptions</div>
        <div class="stat-grid" style="--cols:${assumptionRows.length}; margin-bottom:18px;">
          ${assumptionRows.map(([label, value]) => `<div class="stat-box"><div class="label">${label}</div><div class="value" style="font-size:14px;">${value}</div></div>`).join('')}
        </div>`
          : '';
      const tableRows = rows
        .map(
          (r) => `<tr>
        <td>${escOrDash(r.year)}</td><td>${formatCurrency(r.grossIncome)}</td><td>${formatCurrency(r.vacancyLoss)}</td>
        <td>${formatCurrency(r.operatingExpenses)}</td><td>${formatCurrency(r.noi)}</td><td>${formatCurrency(r.cashFlow)}</td>
      </tr>`
        )
        .join('');
      const table = cashFlows.length
        ? `<div class="subhead">Projected Cash Flow</div>
        <table class="pdf-table">
          <thead><tr><th>Year</th><th>Gross Income</th><th>Vacancy Loss</th><th>Operating Expenses</th><th>NOI</th><th>Cash Flow</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>`
        : '';
      const inner = `
        ${headerBar(cover.propertyName, 'Pro Forma', !isFirst)}
        <div class="section-title">Pro Forma</div>
        <div class="gold-rule"></div>
        ${assumptionsBlock}
        ${table}
      `;
      pages.push(pageShell(inner));
    });
  }

  return pages;
}
