import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import AutofilledTag from '../AutofilledTag.jsx';
import { clearAutofilled } from '../../lib/autofill.js';
import { PhoneInput } from '../inputs/FormattedInputs.jsx';

function makeId() {
  return `member-${Date.now()}`;
}

export default function BrokerInfoSection({ omId, om, onUpdateOm }) {
  const team = om.team || [];
  const primary = team[0] || { id: makeId(), name: '', title: '', phone: '', email: '', bio: '', headshot: null };
  const cover = om.cover || {};

  function setTeam(field, val) {
    const baseTeam = team.length ? team : [primary];
    const updated = baseTeam.map((m, i) => (i === 0 ? { ...m, [field]: val } : m));
    onUpdateOm({ team: updated });
    clearAutofilled(om, onUpdateOm, 'team.0');
  }

  function setCover(field, val) {
    onUpdateOm({ cover: { ...om.cover, [field]: val } });
    clearAutofilled(om, onUpdateOm, `cover.${field}`);
  }

  return (
    <div className="section-form">
      <h2>Broker Info</h2>
      <p className="section-hint">Contact details shown in the broker panel and footer of the One Pager.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.team}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, team: text } })}
      />

      <div className="field-row">
        <div className="field">
          <div className="field-label-row">
            <label>Name</label>
            <AutofilledTag om={om} field="team.0" />
          </div>
          <input type="text" value={primary.name} onChange={(e) => setTeam('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Title</label>
          <input type="text" value={primary.title} onChange={(e) => setTeam('title', e.target.value)} placeholder="e.g. Senior Vice President" />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Phone</label>
          <PhoneInput value={primary.phone} onChange={(v) => setTeam('phone', v)} placeholder="(555) 123-4567" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={primary.email} onChange={(e) => setTeam('email', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Headshot</label>
        <FileUpload omId={omId} accept="image/*" onUploaded={(refs) => setTeam('headshot', refs[0])} />
        {primary.headshot && <FilePreview files={[primary.headshot]} onRemove={() => setTeam('headshot', null)} />}
      </div>

      <hr className="divider" />

      <div className="field">
        <label>Brokerage Logo</label>
        <FileUpload omId={omId} accept="image/*" hint="Shown next to the broker on the One Pager." onUploaded={(refs) => setCover('brokerLogo', refs[0])} />
        {cover.brokerLogo && <FilePreview files={[cover.brokerLogo]} onRemove={() => setCover('brokerLogo', null)} />}
      </div>

      <div className="field-row">
        <div className="field">
          <div className="field-label-row">
            <label>Brokerage Name</label>
            <AutofilledTag om={om} field="cover.brokerageName" />
          </div>
          <input
            type="text"
            value={cover.brokerageName}
            onChange={(e) => setCover('brokerageName', e.target.value)}
            placeholder="e.g. Cotton Commercial Real Estate"
          />
        </div>
        <div className="field">
          <label>Website</label>
          <input type="text" value={cover.brokerageWebsite} onChange={(e) => setCover('brokerageWebsite', e.target.value)} placeholder="www.cottoncre.com" />
        </div>
      </div>
    </div>
  );
}
