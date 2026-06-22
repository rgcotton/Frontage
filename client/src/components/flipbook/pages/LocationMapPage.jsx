import { useState } from 'react';

export default function LocationMapPage({ om }) {
  const [failed, setFailed] = useState(false);
  const { cover } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="fp-page">
      <div className="fp-title">Location &amp; Amenities</div>
      <div className="fp-subtitle">{addressLine || 'Address not provided'}</div>
      <div className="fp-gold-rule" />
      {!failed ? (
        <img className="fp-map" src={`/api/oms/${om.id}/static-map.png`} alt="Location map" onError={() => setFailed(true)} />
      ) : (
        <div className="fp-map-placeholder">
          Map preview unavailable. Configure GOOGLE_MAPS_API_KEY and a valid property address to display nearby amenities and demand drivers here.
        </div>
      )}
    </div>
  );
}
