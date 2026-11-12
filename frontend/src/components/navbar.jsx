import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const location = useLocation();

  const syncState = () => {
    const notifs = JSON.parse(localStorage.getItem("campus_notifications") || "[]");
    const unread = notifs.filter((n) => !n.read).length;
    setUnreadCount(unread);

    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(savedUser);
  };

  useEffect(() => {
    syncState();
    window.addEventListener("notifications_updated", syncState);
    window.addEventListener("storage", syncState);
    return () => {
      window.removeEventListener("notifications_updated", syncState);
      window.removeEventListener("storage", syncState);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand / Logo */}
        <Link to="/" className="brand-lockup">
          <div className="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-title">
              GLA <span>SMART CAMPUS</span>
            </div>
            <div className="brand-tagline">AI-Powered Lost & Found Portal</div>
          </div>
        </Link>

        {/* Live Engine Status Capsule */}
        <div className="live-status-pill">
          <span className="live-pulse"></span>
          <span className="live-text">MobileNetV2 & NLP Engine Online</span>
        </div>

        {/* Navigation Links */}
        <nav className="header-nav">
          <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>

          <Link
            to="/report-lost"
            className={`nav-item nav-lost ${isActive("/report-lost") ? "active-lost" : ""}`}
          >
            <span className="dot-crimson"></span>
            Report Lost
          </Link>

          <Link
            to="/report-found"
            className={`nav-item nav-found ${isActive("/report-found") ? "active-found" : ""}`}
          >
            <span className="dot-forest"></span>
            Report Found
          </Link>

          <Link
            to="/notifications"
            className={`nav-item nav-notif ${isActive("/notifications") ? "active" : ""}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Alerts</span>
            {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount}</span>}
          </Link>
        </nav>

        {/* User Account / Auth Actions */}
        <div className="header-actions">
          {user ? (
            <div className="user-profile-badge">
              <div className="user-avatar-initial">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="user-details">
                <span className="user-display-name">{user.name || "GLA Student"}</span>
                <span className="user-email-domain">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-login-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn-register-cta">
                Student Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
