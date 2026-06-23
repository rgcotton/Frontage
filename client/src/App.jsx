import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Editor from './pages/Editor.jsx';
import SharePage from './pages/SharePage.jsx';
import SignupScreen from './components/SignupScreen.jsx';
import { getUser } from './lib/user.js';

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
  const [user, setUser] = useState(() => getUser());

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={user ? <Home /> : <SignupScreen onComplete={setUser} />} />
        <Route
          path="/om/:id"
          element={
            user ? (
              <>
                <TopBar />
                <Editor />
              </>
            ) : (
              <SignupScreen onComplete={setUser} />
            )
          }
        />
        <Route path="/share/:id" element={<SharePage />} />
      </Routes>
    </div>
  );
}

export default App;
