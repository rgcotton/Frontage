import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Editor from './pages/Editor.jsx';
import SharePage from './pages/SharePage.jsx';

function TopBar() {
  return (
    <div className="topbar">
      <Link to="/" className="brand">
        <span className="dot" />
        PropDocs
      </Link>
      <div className="spacer" />
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/om/:id"
          element={
            <>
              <TopBar />
              <Editor />
            </>
          }
        />
        <Route path="/share/:id" element={<SharePage />} />
      </Routes>
    </div>
  );
}

export default App;
