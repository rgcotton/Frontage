import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import { PhoneInput } from '../inputs/FormattedInputs.jsx';

let nextId = 1;
function makeId() {
  return `member-${Date.now()}-${nextId++}`;
}

export default function TeamSection({ value, onChange, omId, om, onUpdateOm }) {
  const team = value || [];

  function update(id, field, val) {
    onChange(team.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  }

  function addMember() {
    onChange([...team, { id: makeId(), name: '', title: '', phone: '', email: '', bio: '', headshot: null }]);
  }

  function removeMember(id) {
    onChange(team.filter((m) => m.id !== id));
  }

  return (
    <div className="section-form">
      <h2>About the Team</h2>
      <p className="section-hint">Broker contact information and bios for the team page. The brokerage logo from the Cover Page is used automatically on the Team and Back Cover pages.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.team}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, team: text } })}
      />

      {team.map((m, i) => (
        <div className="repeat-card" key={m.id}>
          <div className="repeat-card-header">
            <span>Team Member {i + 1}</span>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Name</label>
              <input type="text" value={m.name} onChange={(e) => update(m.id, 'name', e.target.value)} />
            </div>
            <div className="field">
              <label>Title</label>
              <input type="text" value={m.title} onChange={(e) => update(m.id, 'title', e.target.value)} placeholder="e.g. Senior Vice President" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Phone</label>
              <PhoneInput value={m.phone} onChange={(v) => update(m.id, 'phone', v)} placeholder="(555) 123-4567" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={m.email} onChange={(e) => update(m.id, 'email', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea value={m.bio} onChange={(e) => update(m.id, 'bio', e.target.value)} />
          </div>
          <div className="field">
            <label>Headshot</label>
            <FileUpload omId={omId} accept="image/*" onUploaded={(refs) => update(m.id, 'headshot', refs[0])} />
            {m.headshot && <FilePreview files={[m.headshot]} onRemove={() => update(m.id, 'headshot', null)} />}
          </div>
          <button type="button" className="btn-danger-text" onClick={() => removeMember(m.id)}>
            Remove team member
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addMember}>
        + Add Team Member
      </button>
    </div>
  );
}
