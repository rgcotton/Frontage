import { useEffect, useRef, useState } from 'react';
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
import { getNavVisibility } from '../../lib/flipbookNav.js';

export default function Flipbook({ om }) {
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [om.id]);

  const hasOverview = Boolean(
    om.overview?.yearBuilt || om.overview?.squareFootage || om.overview?.lotSize ||
    om.overview?.description || (om.overview?.photos || []).length
  );
  const hasExecutiveSummary = Boolean(
    om.executiveSummary?.narrative ||
    (om.executiveSummary?.highlights || []).filter(Boolean).length ||
    om.executiveSummary?.offeringPrice || om.executiveSummary?.capRate || om.executiveSummary?.noi
  );
  const hasMarket = Boolean(om.market?.narrative || om.market?.marketName);
  const hasFinancials = Boolean(
    (om.financials?.lineItems || []).length ||
    om.financials?.grossIncome || om.financials?.operatingExpenses
  );
  const hasLocationMap = Boolean(om.cover?.lat && om.cover?.lng);
  const hasOfferingProcedures = Boolean(
    om.offeringProcedures?.loiInstructions || om.offeringProcedures?.tourInstructions ||
    om.offeringProcedures?.offerDeadline || om.offeringProcedures?.dataRoomLink
  );

  const pages = [
    { key: 'cover', node: <CoverPage om={om} /> },
    { key: 'toc', node: <TocPage /> },
    ...(hasOverview ? [{ key: 'overview', node: <OverviewPage om={om} /> }] : []),
    ...(hasExecutiveSummary ? [{ key: 'executiveSummary', node: <ExecutiveSummaryPage om={om} /> }] : []),
    ...(hasMarket ? [{ key: 'market', node: <MarketPage om={om} /> }] : []),
    ...(hasFinancials ? [{ key: 'financials', node: <FinancialsPage om={om} /> }] : []),
    ...((om.salesComps || []).length ? [{ key: 'salesComps', node: <SalesCompsPage om={om} /> }] : []),
    ...((om.rentComps || []).length ? [{ key: 'rentComps', node: <RentCompsPage om={om} /> }] : []),
    ...(hasLocationMap ? [{ key: 'locationMap', node: <LocationMapPage om={om} /> }] : []),
    ...((om.driveTimePois || []).length ? [{ key: 'driveTimePois', node: <DriveTimesPage om={om} /> }] : []),
    ...(hasOfferingProcedures ? [{ key: 'offeringProcedures', node: <OfferingProceduresPage om={om} /> }] : []),
    ...(om.team || []).map((m) => ({ key: `team-${m.id}`, node: <TeamMemberPage member={m} /> })),
    { key: 'backCover', node: <BackCoverPage om={om} /> },
  ];

  const { showPrev, showNext } = getNavVisibility(currentPage, pages.length);

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
        onFlip={(e) => setCurrentPage(e.data)}
      >
        {pages.map(({ key, node }) => (
          <PageWrapper key={key}>{node}</PageWrapper>
        ))}
      </HTMLFlipBook>
      {(showPrev || showNext) && (
        <div className="flipbook-nav">
          {showPrev && (
            <button type="button" className="flipbook-nav-btn" onClick={prev} aria-label="Previous page">
              ←
            </button>
          )}
          {showNext && (
            <button type="button" className="flipbook-nav-btn" onClick={next} aria-label="Next page">
              →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
