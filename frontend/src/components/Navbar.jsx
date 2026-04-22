import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(res => setUnread(res.data.count))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🪺</span>
          <span className="logo-text">NewsNest</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Feed</Link>
          <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Search</Link>
          <Link to="/bookmarks" className={`nav-link ${isActive('/bookmarks') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Bookmarks</Link>
          <Link to="/notifications" className={`nav-link notif-link ${isActive('/notifications') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Notifications
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <span className="avatar">{user?.name?.[0]?.toUpperCase()}</span>
          </Link>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
