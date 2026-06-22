import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';

let nextId = 1;
function makeId() {
  return `li-${Date.now()}-${nextId++}`;
}

export default function FinancialsSection({ value, onChange, omId }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  function updateLineItem(id, field, val) {
    set(
      'lineItems',
      value.lineItems.map((li) => (li.id === id ? { ...li, [field]: val } : li))
    );
  }

  function addLineItem() {
    set('lineItems', [...(value.lineItems || []), { id: makeId(), label: '', income: '', expense: '' }]);
  }

  function removeLineItem(id) {
    set('lineItems', value.lineItems.filter((li) => li.id !== id));
  }

  return (
    <div className="section-form">
      <h2>Financial Summary</h2>
      <p className="section-hint">Headline metrics and the income / expense breakdown.</p>

      <div className="field-row cols-3">
        <div className="field">
          <label>Asking Price</label>
          <input type="text" value={value.askingPrice} onChange={(e) => set('askingPrice', e.target.value)} placeholder="$5,000,000" />
        </div>
        <div className="field">
          <label>NOI</label>
          <input type="text" value={value.noi} onChange={(e) => set('noi', e.target.value)} placeholder="$325,000" />
        </div>
        <div className="field">
          <label>Cap Rate</label>
          <input type="text" value={value.capRate} onChange={(e) => set('capRate', e.target.value)} placeholder="6.5%" />
        </div>
      </div>

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

      <div className="subsection-title">Income &amp; Expense Line Items</div>
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

      <div className="field">
        <label>Rent Roll / Financial Statement</label>
        <FileUpload omId={omId} accept=".pdf,.doc,.docx,.xls,.xlsx" hint="Upload supporting financial documents (PDF, Word, Excel)." onUploaded={(refs) => set('rentRollFile', refs[0])} />
        {value.rentRollFile && <FilePreview files={[value.rentRollFile]} onRemove={() => set('rentRollFile', null)} />}
      </div>
    </div>
  );
}
