import { useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import PageWrapper from './PageWrapper.jsx';
import CoverPage from './pages/CoverPage.jsx';
import TocPage from './pages/TocPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import FinancialsPage from './pages/FinancialsPage.jsx';
import SalesCompsPage from './pages/SalesCompsPage.jsx';
import RentCompsPage from './pages/RentCompsPage.jsx';
import LocationMapPage from './pages/LocationMapPage.jsx';
import DriveTimesPage from './pages/DriveTimesPage.jsx';
import OfferingProceduresPage from './pages/OfferingProceduresPage.jsx';
import TeamMemberPage from './pages/TeamMemberPage.jsx';
import BackCoverPage from './pages/BackCoverPage.jsx';

export default function Flipbook({ om }) {
  const bookRef = useRef(null);

  const pages = [
    { key: 'cover', node: <CoverPage om={om} /> },
    { key: 'toc', node: <TocPage /> },
    { key: 'overview', node: <OverviewPage om={om} /> },
    { key: 'executiveSummary', node: <ExecutiveSummaryPage om={om} /> },
    { key: 'market', node: <MarketPage om={om} /> },
    { key: 'financials', node: <FinancialsPage om={om} /> },
    ...((om.salesComps || []).length ? [{ key: 'salesComps', node: <SalesCompsPage om={om} /> }] : []),
    ...((om.rentComps || []).length ? [{ key: 'rentComps', node: <RentCompsPage om={om} /> }] : []),
    { key: 'locationMap', node: <LocationMapPage om={om} /> },
    ...((om.driveTimePois || []).length ? [{ key: 'driveTimePois', node: <DriveTimesPage om={om} /> }] : []),
    { key: 'offeringProcedures', node: <OfferingProceduresPage om={om} /> },
    ...(om.team || []).map((m) => ({ key: `team-${m.id}`, node: <TeamMemberPage member={m} /> })),
    { key: 'backCover', node: <BackCoverPage om={om} /> },
  ];

  function prev() {
    bookRef.current?.pageFlip()?.flipPrev();
  }
  function next() {
    bookRef.current?.pageFlip()?.flipNext();
  }

  return (
    <div className="flipbook-shell">
      <HTMLFlipBook
        width={520}
        height={693}
        size="stretch"
        minWidth={300}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1400}
        showCover={false}
        maxShadowOpacity={0.3}
        mobileScrollSupport
        useMouseEvents
        className="flipbook"
        ref={bookRef}
      >
        {pages.map(({ key, node }) => (
          <PageWrapper key={key}>{node}</PageWrapper>
        ))}
      </HTMLFlipBook>
      <div className="flipbook-nav">
        <button type="button" className="flipbook-nav-btn" onClick={prev} aria-label="Previous page">
          ←
        </button>
        <button type="button" className="flipbook-nav-btn" onClick={next} aria-label="Next page">
          →
        </button>
      </div>
    </div>
  );
}
