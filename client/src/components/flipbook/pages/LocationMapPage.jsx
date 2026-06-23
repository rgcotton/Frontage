import { useState } from 'react';

function MapImage({ src, alt, grow = 1 }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="fp-map-placeholder" style={{ flexGrow: grow }}>
        Map preview unavailable. Configure GOOGLE_MAPS_API_KEY and a valid property address to display nearby amenities and demand drivers here.
      </div>
    );
  }
  return <img className="fp-map" style={{ flexGrow: grow }} src={src} alt={alt} onError={() => setFailed(true)} />;
}

export default function LocationMapPage({ om }) {
  const { cover } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="fp-page">
      <div className="fp-title">Location &amp; Amenities</div>
      <div className="fp-subtitle">{addressLine || 'Address not provided'}</div>
      <div className="fp-gold-rule" />
      <div className="fp-subhead" style={{ marginTop: 0 }}>
        Street View
      </div>
      <MapImage src={`/api/oms/${om.id}/static-map.png`} alt="Street-level location map" grow={1.6} />
      <div className="fp-subhead">Regional Overview</div>
      <MapImage src={`/api/oms/${om.id}/static-map.png?type=regional`} alt="Regional overview map" grow={1} />
    </div>
  );
}
