import { useEffect, useRef, useState } from 'react';

export default function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="account-menu" ref={ref}>
      <button type="button" className="account-menu-trigger dashboard-user" onClick={() => setOpen((v) => !v)}>
        👤 {user.name}
      </button>
      {open && (
        <div className="account-menu-dropdown">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
