import { isAutofilled } from '../lib/autofill.js';

export default function AutofilledTag({ om, field }) {
  if (!isAutofilled(om, field)) return null;
  return (
    <span className="autofilled-tag" title="Auto-filled from your imported document — review this value">
      ✨ Auto-filled
    </span>
  );
}
