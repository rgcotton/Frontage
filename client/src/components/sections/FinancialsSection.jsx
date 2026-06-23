import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';

let nextId = 1;
function makeId(prefix) {
  return `${prefix}-${Date.now()}-${nextId++}`;
}

const LEASE_TYPES = ['NNN', 'Gross', 'Modified Gross'];

export default function FinancialsSection({ value, onChange, omId, om, onUpdateOm }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  function updateLineItem(id, field, val) {
    set('lineItems', value.lineItems.map((li) => (li.id === id ? { ...li, [field]: val } : li)));
  }
  function addLineItem() {
    set('lineItems', [...(value.lineItems || []), { id: makeId('li'), label: '', income: '', expense: '' }]);
  }
  function removeLineItem(id) {
    set('lineItems', value.lineItems.filter((li) => li.id !== id));
  }

  function updateRentRollRow(id, field, val) {
    set('rentRoll', value.rentRoll.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  }
  function addRentRollRow() {
    set('rentRoll', [
      ...(value.rentRoll || []),
      { id: makeId('rr'), tenantName: '', suite: '', sf: '', leaseStart: '', leaseEnd: '', monthlyRent: '', annualRent: '', leaseType: '' },
    ]);
  }
  function removeRentRollRow(id) {
    set('rentRoll', value.rentRoll.filter((r) => r.id !== id));
  }

  function setAssumption(field, val) {
    set('proForma', { ...value.proForma, assumptions: { ...value.proForma.assumptions, [field]: val } });
  }
  function updateCashFlowRow(id, field, val) {
    set('proForma', {
      ...value.proForma,
      cashFlows: value.proForma.cashFlows.map((r) => (r.id === id ? { ...r, [field]: val } : r)),
    });
  }
  function addCashFlowRow() {
    set('proForma', {
      ...value.proForma,
      cashFlows: [...(value.proForma.cashFlows || []), { id: makeId('cf'), year: '', grossIncome: '', vacancyLoss: '', operatingExpenses: '', noi: '', cashFlow: '' }],
    });
  }
  function removeCashFlowRow(id) {
    set('proForma', { ...value.proForma, cashFlows: value.proForma.cashFlows.filter((r) => r.id !== id) });
  }

  const es = om?.executiveSummary || {};

  return (
    <div className="section-form">
      <h2>Financials</h2>
      <p className="section-hint">Income, expenses, rent roll, and pro forma projections.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.financials}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, financials: text } })}
      />

      <div className="field-row cols-3">
        <div className="field">
          <label>Asking Price</label>
          <input type="text" value={es.offeringPrice || ''} readOnly disabled placeholder="Set on Executive Summary" />
        </div>
        <div className="field">
          <label>NOI</label>
          <input type="text" value={es.noi || ''} readOnly disabled placeholder="Set on Executive Summary" />
        </div>
        <div className="field">
          <label>Cap Rate</label>
          <input type="text" value={es.capRate || ''} readOnly disabled placeholder="Set on Executive Summary" />
        </div>
      </div>
      <p className="field-hint" style={{ marginTop: -8, marginBottom: 16 }}>
        Asking Price, NOI, and Cap Rate are set on the Executive Summary page and automatically appear here and throughout the OM.
      </p>

      <div className="field-row">
        <div className="field">
          <label>Gross Income</label>
          <input type="text" value={value.grossIncome} onChange={(e) => set('grossIncome', e.target.value)} placeholder="$480,000" />
        </div>
        <div className="field">
          <label>Operating Expenses</label>
          <input type="text" value={value.operatingExpenses} onChange={(e) => set('operatingExpenses', e.target.value)} placeholder="$155,000" />
        </div>
      </div>

      <hr className="divider" />

      <div className="subsection-title">T12 Income &amp; Expense Line Items</div>
      {(value.lineItems || []).map((li) => (
        <div className="repeat-card" key={li.id}>
          <div className="field-row cols-3">
            <div className="field">
              <label>Line Item</label>
              <input type="text" value={li.label} onChange={(e) => updateLineItem(li.id, 'label', e.target.value)} placeholder="e.g. Base Rent" />
            </div>
            <div className="field">
              <label>Income</label>
              <input type="text" value={li.income} onChange={(e) => updateLineItem(li.id, 'income', e.target.value)} />
            </div>
            <div className="field">
              <label>Expense</label>
              <input type="text" value={li.expense} onChange={(e) => updateLineItem(li.id, 'expense', e.target.value)} />
            </div>
          </div>
          <button type="button" className="btn-danger-text" onClick={() => removeLineItem(li.id)}>
            Remove line item
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addLineItem}>
        + Add Line Item
      </button>

      <hr className="divider" />

      <div className="subsection-title">Rent Roll</div>
      {(value.rentRoll || []).map((r) => (
        <div className="repeat-card" key={r.id}>
          <div className="field-row cols-3">
            <div className="field">
              <label>Tenant Name</label>
              <input type="text" value={r.tenantName} onChange={(e) => updateRentRollRow(r.id, 'tenantName', e.target.value)} />
            </div>
            <div className="field">
              <label>Suite</label>
              <input type="text" value={r.suite} onChange={(e) => updateRentRollRow(r.id, 'suite', e.target.value)} />
            </div>
            <div className="field">
              <label>SF</label>
              <input type="text" value={r.sf} onChange={(e) => updateRentRollRow(r.id, 'sf', e.target.value)} />
            </div>
          </div>
          <div className="field-row cols-3">
            <div className="field">
              <label>Lease Start</label>
              <input type="date" value={r.leaseStart} onChange={(e) => updateRentRollRow(r.id, 'leaseStart', e.target.value)} />
            </div>
            <div className="field">
              <label>Lease End</label>
              <input type="date" value={r.leaseEnd} onChange={(e) => updateRentRollRow(r.id, 'leaseEnd', e.target.value)} />
            </div>
            <div className="field">
              <label>Lease Type</label>
              <select value={r.leaseType} onChange={(e) => updateRentRollRow(r.id, 'leaseType', e.target.value)}>
                <option value="">Select…</option>
                {LEASE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Monthly Rent</label>
              <input type="text" value={r.monthlyRent} onChange={(e) => updateRentRollRow(r.id, 'monthlyRent', e.target.value)} />
            </div>
            <div className="field">
              <label>Annual Rent</label>
              <input type="text" value={r.annualRent} onChange={(e) => updateRentRollRow(r.id, 'annualRent', e.target.value)} />
            </div>
          </div>
          <button type="button" className="btn-danger-text" onClick={() => removeRentRollRow(r.id)}>
            Remove rent roll row
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addRentRollRow}>
        + Add Rent Roll Row
      </button>

      <hr className="divider" />

      <div className="subsection-title">Pro Forma Assumptions</div>
      <div className="field-row cols-3">
        <div className="field">
          <label>Rent Growth</label>
          <input type="text" value={value.proForma.assumptions.rentGrowthPct} onChange={(e) => setAssumption('rentGrowthPct', e.target.value)} placeholder="3%" />
        </div>
        <div className="field">
          <label>Expense Growth</label>
          <input type="text" value={value.proForma.assumptions.expenseGrowthPct} onChange={(e) => setAssumption('expenseGrowthPct', e.target.value)} placeholder="2.5%" />
        </div>
        <div className="field">
          <label>Vacancy</label>
          <input type="text" value={value.proForma.assumptions.vacancyPct} onChange={(e) => setAssumption('vacancyPct', e.target.value)} placeholder="5%" />
        </div>
      </div>
      <div className="field-row cols-3">
        <div className="field">
          <label>Hold Period (Years)</label>
          <input type="text" value={value.proForma.assumptions.holdPeriodYears} onChange={(e) => setAssumption('holdPeriodYears', e.target.value)} placeholder="5" />
        </div>
        <div className="field">
          <label>Exit Cap Rate</label>
          <input type="text" value={value.proForma.assumptions.exitCapRate} onChange={(e) => setAssumption('exitCapRate', e.target.value)} placeholder="6.75%" />
        </div>
      </div>

      <div className="subsection-title">Projected Cash Flow</div>
      {(value.proForma.cashFlows || []).map((r) => (
        <div className="repeat-card" key={r.id}>
          <div className="field-row cols-3">
            <div className="field">
              <label>Year</label>
              <input type="text" value={r.year} onChange={(e) => updateCashFlowRow(r.id, 'year', e.target.value)} placeholder="Year 1" />
            </div>
            <div className="field">
              <label>Gross Income</label>
              <input type="text" value={r.grossIncome} onChange={(e) => updateCashFlowRow(r.id, 'grossIncome', e.target.value)} />
            </div>
            <div className="field">
              <label>Vacancy Loss</label>
              <input type="text" value={r.vacancyLoss} onChange={(e) => updateCashFlowRow(r.id, 'vacancyLoss', e.target.value)} />
            </div>
          </div>
          <div className="field-row cols-3">
            <div className="field">
              <label>Operating Expenses</label>
              <input type="text" value={r.operatingExpenses} onChange={(e) => updateCashFlowRow(r.id, 'operatingExpenses', e.target.value)} />
            </div>
            <div className="field">
              <label>NOI</label>
              <input type="text" value={r.noi} onChange={(e) => updateCashFlowRow(r.id, 'noi', e.target.value)} />
            </div>
            <div className="field">
              <label>Cash Flow</label>
              <input type="text" value={r.cashFlow} onChange={(e) => updateCashFlowRow(r.id, 'cashFlow', e.target.value)} />
            </div>
          </div>
          <button type="button" className="btn-danger-text" onClick={() => removeCashFlowRow(r.id)}>
            Remove year
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addCashFlowRow}>
        + Add Cash Flow Year
      </button>

      <hr className="divider" />

      <div className="field">
        <label>Rent Roll / Financial Statement (Supporting Document)</label>
        <FileUpload omId={omId} accept=".pdf,.doc,.docx,.xls,.xlsx" hint="Upload supporting financial documents (PDF, Word, Excel)." onUploaded={(refs) => set('rentRollFile', refs[0])} />
        {value.rentRollFile && <FilePreview files={[value.rentRollFile]} onRemove={() => set('rentRollFile', null)} />}
      </div>
    </div>
  );
}
