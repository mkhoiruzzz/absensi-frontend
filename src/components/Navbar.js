import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';


const Navbar = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Brand/Logo */}
          <div className="navbar-brand">
            <div className="brand-icon">📚</div>
            <div className="brand-text">
              <span className="brand-title">Sistem Absensi</span>
              <span className="brand-subtitle">Siswa</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${isActiveLink('/')}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/rekap" 
                className={`nav-link ${isActiveLink('/rekap')}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Rekap Absensi</span>
              </Link>
            </li>
          </ul>

          {/* User Menu & Actions */}
          <div className="navbar-actions">
            {/* User Profile */}
            <div className="user-profile">
              <div className="user-avatar">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser?.name}</span>
                <span className="user-role">Siswa</span>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              title="Keluar dari sistem"
            >
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <div className="mobile-user-profile">
              <div className="user-avatar large">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser?.name}</span>
                <span className="user-details">
                  NIS: {currentUser?.nis} | {currentUser?.kelas}
                </span>
              </div>
            </div>
            <button 
              className="mobile-menu-close"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <ul className="mobile-nav-links">
            <li className="mobile-nav-item">
              <Link 
                to="/" 
                className={`mobile-nav-link ${isActiveLink('/')}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link 
                to="/rekap" 
                className={`mobile-nav-link ${isActiveLink('/rekap')}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Rekap Absensi</span>
              </Link>
            </li>
            <li className="mobile-nav-item">
              <button 
                onClick={handleLogout} 
                className="mobile-logout-btn"
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Logout</span>
              </button>
            </li>
          </ul>

          <div className="mobile-menu-footer">
            <div className="system-info">
              <span>📚 Sistem Absensi Siswa</span>
              <span className="version">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Overlay untuk mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={closeMobileMenu}
          ></div>
        )}
      </nav>

      {/* Spacer untuk fixed navbar */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;