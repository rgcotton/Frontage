import CustomAiInstructions from '../CustomAiInstructions.jsx';

let nextId = 1;
function makeId() {
  return `rcomp-${Date.now()}-${nextId++}`;
}

const LEASE_TYPES = ['NNN', 'Gross', 'Modified Gross'];

export default function RentCompsSection({ value, onChange, om, onUpdateOm }) {
  const comps = value || [];

  function update(id, field, val) {
    onChange(comps.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  }

  function addComp() {
    onChange([...comps, { id: makeId(), address: '', tenant: '', rentPerSF: '', leaseTerm: '', squareFeet: '', leaseType: '' }]);
  }

  function removeComp(id) {
    onChange(comps.filter((c) => c.id !== id));
  }

  return (
    <div className="section-form">
      <h2>Rent Comparables</h2>
      <p className="section-hint">Comparable lease transactions to benchmark achievable rents.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.rentComps}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, rentComps: text } })}
      />

      {comps.map((c, i) => (
        <div className="repeat-card" key={c.id}>
          <div className="repeat-card-header">
            <span>Comp {i + 1}</span>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Address</label>
              <input type="text" value={c.address} onChange={(e) => update(c.id, 'address', e.target.value)} />
            </div>
            <div className="field">
              <label>Tenant</label>
              <input type="text" value={c.tenant} onChange={(e) => update(c.id, 'tenant', e.target.value)} />
            </div>
          </div>
          <div className="field-row cols-3">
            <div className="field">
              <label>Rent / SF</label>
              <input type="text" value={c.rentPerSF} onChange={(e) => update(c.id, 'rentPerSF', e.target.value)} placeholder="$28.50" />
            </div>
            <div className="field">
              <label>Lease Term</label>
              <input type="text" value={c.leaseTerm} onChange={(e) => update(c.id, 'leaseTerm', e.target.value)} placeholder="5 years" />
            </div>
            <div className="field">
              <label>Square Feet</label>
              <input type="text" value={c.squareFeet} onChange={(e) => update(c.id, 'squareFeet', e.target.value)} placeholder="2,400 SF" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Lease Type</label>
              <select value={c.leaseType} onChange={(e) => update(c.id, 'leaseType', e.target.value)}>
                <option value="">Select…</option>
                {LEASE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="btn-danger-text" onClick={() => removeComp(c.id)}>
            Remove comp
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addComp}>
        + Add Rent Comp
      </button>
    </div>
  );
}
