import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import Sidebar, { SECTIONS } from '../components/Sidebar.jsx';
import OutputPanel from '../components/OutputPanel.jsx';
import CoverSection from '../components/sections/CoverSection.jsx';
import OverviewSection from '../components/sections/OverviewSection.jsx';
import ExecutiveSummarySection from '../components/sections/ExecutiveSummarySection.jsx';
import MarketSection from '../components/sections/MarketSection.jsx';
import FinancialsSection from '../components/sections/FinancialsSection.jsx';
import SalesCompsSection from '../components/sections/SalesCompsSection.jsx';
import RentCompsSection from '../components/sections/RentCompsSection.jsx';
import LocationMapSection from '../components/sections/LocationMapSection.jsx';
import OfferingProceduresSection from '../components/sections/OfferingProceduresSection.jsx';
import TeamSection from '../components/sections/TeamSection.jsx';

const SECTION_COMPONENTS = {
  cover: CoverSection,
  overview: OverviewSection,
  executiveSummary: ExecutiveSummarySection,
  market: MarketSection,
  financials: FinancialsSection,
  salesComps: SalesCompsSection,
  rentComps: RentCompsSection,
  locationMap: LocationMapSection,
  offeringProcedures: OfferingProceduresSection,
  team: TeamSection,
};

export default function Editor() {
  const { id } = useParams();
  const [om, setOm] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [activeSection, setActiveSection] = useState('cover');
  const [saveStatus, setSaveStatus] = useState('idle');
  const omRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    api
      .getOm(id)
      .then((data) => {
        setOm(data);
        omRef.current = data;
      })
      .catch((err) => setLoadError(err.message));
  }, [id]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function scheduleSave() {
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.updateOm(id, omRef.current);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 600);
  }

  function updateSection(key, value) {
    setOm((prev) => {
      const next = { ...prev, [key]: value };
      omRef.current = next;
      return next;
    });
    scheduleSave();
  }

  if (loadError) {
    return <div className="center-page">Could not load this offering memorandum: {loadError}</div>;
  }
  if (!om) {
    return <div className="center-page">Loading…</div>;
  }

  const ActiveComponent = SECTION_COMPONENTS[activeSection];
  const activeIndex = SECTIONS.findIndex((s) => s.key === activeSection);

  return (
    <div className="editor-layout">
      <Sidebar activeKey={activeSection} onSelect={setActiveSection} propertyName={om.cover.propertyName} om={om} />

      <main className="editor-main">
        <div className="save-indicator" style={{ marginBottom: 16 }}>
          <span className={saveStatus === 'saving' ? 'saving-dot' : 'saved-dot'} />
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Could not save — retrying' : 'All changes saved'}
        </div>

        <div className="section-fade" key={activeSection}>
          <ActiveComponent
            value={om[activeSection]}
            onChange={(val) => updateSection(activeSection, val)}
            omId={om.id}
            om={om}
            onNavigateToSection={setActiveSection}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button
            className="btn btn-ghost"
            disabled={activeIndex === 0}
            onClick={() => setActiveSection(SECTIONS[activeIndex - 1].key)}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary"
            disabled={activeIndex === SECTIONS.length - 1}
            onClick={() => setActiveSection(SECTIONS[activeIndex + 1].key)}
          >
            Next →
          </button>
        </div>
      </main>

      <OutputPanel om={om} />
    </div>
  );
}
