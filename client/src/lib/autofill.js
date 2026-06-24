export function isAutofilled(om, field) {
  return (om?.autofilledFields || []).includes(field);
}

// Clears the "auto-filled, please review" flag for a single field the moment the
// broker edits it -- once they've touched it, it no longer needs a second look.
export function clearAutofilled(om, onUpdateOm, field) {
  if (isAutofilled(om, field)) {
    onUpdateOm({ autofilledFields: om.autofilledFields.filter((f) => f !== field) });
  }
}
