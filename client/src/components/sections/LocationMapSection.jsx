export default function LocationMapSection({ om, onNavigateToSection }) {
  const cover = om?.cover || {};
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="section-form">
      <h2>Location &amp; Amenities</h2>
      <p className="section-hint">A map centered on the property address is generated automatically in the PDF, PowerPoint, and web outputs.</p>

      <div className="field">
        <label>Property Address</label>
        <input type="text" value={addressLine} readOnly disabled placeholder="No address set yet" />
      </div>

      <p className="field-hint">To change the address shown on the map, update it on the Cover Page.</p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigateToSection?.('cover')}>
        Go to Cover Page →
      </button>
    </div>
  );
}
