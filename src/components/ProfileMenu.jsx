import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate initials for avatar fallback
  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      >
        {user?.avatar_url ? (
          <img alt="User profile" className="w-full h-full object-cover" src={user.avatar_url} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface-container-high rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden font-body">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-semibold text-on-surface">{user?.full_name || 'User'}</p>
            <p className="text-xs text-on-surface-variant truncate">{user?.email || ''}</p>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">person</span>
              Profile
            </Link>

          </div>
          <div className="py-1 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
