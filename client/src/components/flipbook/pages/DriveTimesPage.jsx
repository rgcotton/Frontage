import { filterStats } from '../../../lib/format.js';

export default function DriveTimesPage({ om }) {
  const pois = om.driveTimePois || [];

  return (
    <div className="fp-page">
      <div className="fp-title">Drive Times &amp; Points of Interest</div>
      <div className="fp-gold-rule" />
      <div className="fp-card-grid">
        {pois.map((p) => {
          const rows = filterStats([
            ['Category', p.category, String],
            ['Address', p.address, String],
            ['Drive Time', typeof p.driveTimeMinutes === 'number' ? p.driveTimeMinutes : '', (v) => `${v} min`],
          ]);
          return (
            <div className="fp-card" key={p.id}>
              <div className="fp-card-body">
                {p.name && <div className="fp-card-title">{p.name}</div>}
                {rows.map(([label, value]) => (
                  <div className="fp-card-row" key={label}>
                    <span className="l">{label}</span>
                    <span className="v">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
