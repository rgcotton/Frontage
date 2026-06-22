export default function BackCoverPage({ om }) {
  const { cover, team } = om;
  const primary = (team || [])[0];

  return (
    <div className="fp-back-cover">
      {cover.brokerLogo ? (
        <img src={cover.brokerLogo.url} alt="" className="fp-back-logo" />
      ) : (
        <div className="fp-back-logo-text">{cover.propertyName || 'Brokerage'}</div>
      )}
      <div className="fp-gold-rule" style={{ margin: '18px auto' }} />
      {primary && (
        <div className="fp-back-contact">
          <div className="name">{primary.name}</div>
          <div className="title">{primary.title}</div>
          <div className="contact">{[primary.phone, primary.email].filter(Boolean).join('  •  ')}</div>
        </div>
      )}
      <p className="fp-back-disclaimer">
        This Offering Memorandum is confidential and is intended solely for the use of the recipient to evaluate the potential acquisition of the
        property described herein. It shall not be copied, reproduced, or distributed to any other party at any time without the prior written
        consent of the broker of record. The information contained herein has been obtained from sources deemed reliable but is not guaranteed as
        to accuracy or completeness.
      </p>
    </div>
  );
}
