import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'robbiecotton8@gmail.com';

export default function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

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
          {user.email === ADMIN_EMAIL && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/admin/users');
              }}
            >
              Admin
            </button>
          )}
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
