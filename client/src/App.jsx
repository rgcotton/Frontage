import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Editor from './pages/Editor.jsx';
import SharePage from './pages/SharePage.jsx';
import { getUser } from './lib/user.js';

function TopBar() {
  return (
    <div className="topbar">
      <Link to="/" className="brand">
        <span className="dot" />
        Frontage
      </Link>
      <div className="spacer" />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => getUser());

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home key={user?.email ?? 'signed-out'} user={user} onLogin={setUser} onLogout={() => setUser(null)} />} />
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
