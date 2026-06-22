export default function TeamMemberPage({ member }) {
  return (
    <div className="fp-page fp-page--flush">
      <div className="fp-team-layout">
        <div className="fp-team-photo">
          {member.headshot && member.headshot.mimetype?.startsWith('image/') && <img src={member.headshot.url} alt={member.name} />}
        </div>
        <div className="fp-team-info">
          <div className="fp-team-name">{member.name || '—'}</div>
          <div className="fp-team-title">{member.title || ''}</div>
          <div className="fp-team-contact">{[member.phone, member.email].filter(Boolean).join('  •  ')}</div>
          <p className="fp-narrative">{member.bio || 'No bio provided.'}</p>
        </div>
      </div>
    </div>
  );
}
