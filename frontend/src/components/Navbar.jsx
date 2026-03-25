import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LogoutButton from './Logout'

const Navbar = () => {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Groups & Friends', to: '/groups' }, // was /activity which has no page
]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500&display=swap');

        .sp-nav-root {
          font-family: 'Outfit', sans-serif;
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(14,15,12,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .sp-nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.03em;
          color: #f0f2e8;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: opacity 0.2s;
        }
        .sp-nav-logo:hover { opacity: 0.8; }

        .sp-nav-logo-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #c8f135;
          border: 1.5px solid #0e0f0c;
          display: inline-block;
          margin-bottom: 1px;
        }

        .sp-nav-link {
          font-size: 0.82rem;
          font-weight: 500;
          color: #5a5d48;
          text-decoration: none;
          padding: 0.3rem 0;
          position: relative;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }
        .sp-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1.5px;
          background: #c8f135;
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.2s cubic-bezier(0.22,1,0.36,1);
        }
        .sp-nav-link:hover { color: #f0f2e8; }
        .sp-nav-link:hover::after { transform: scaleX(1); }
        .sp-nav-link.active { color: #f0f2e8; }
        .sp-nav-link.active::after { transform: scaleX(1); }

        .sp-nav-divider {
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.07);
          margin: 0 0.25rem;
        }

        /* Mobile hamburger */
        .sp-hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          padding: 4px;
          background: none;
          border: none;
        }
        .sp-hamburger span {
          display: block;
          width: 20px; height: 1.5px;
          background: #6b7055;
          border-radius: 2px;
          transition: all 0.25s;
        }
        .sp-hamburger.open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
        .sp-hamburger.open span:nth-child(2) { opacity: 0; }
        .sp-hamburger.open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

        .sp-mobile-menu {
          display: none;
          flex-direction: column;
          gap: 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: #0e0f0c;
          padding: 0.5rem 0;
        }
        .sp-mobile-menu.open { display: flex; }

        .sp-mobile-link {
          font-size: 0.88rem;
          font-weight: 500;
          color: #5a5d48;
          text-decoration: none;
          padding: 0.75rem 2rem;
          transition: color 0.2s, background 0.2s;
          letter-spacing: 0.01em;
        }
        .sp-mobile-link:hover { color: #f0f2e8; background: rgba(255,255,255,0.03); }
        .sp-mobile-link.active { color: #c8f135; }
        .sp-mobile-logout {
          padding: 0.75rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: 0.25rem;
        }

        @media (max-width: 640px) {
          .sp-nav-links-desktop { display: none !important; }
          .sp-hamburger { display: flex !important; }
        }
      `}</style>

      <nav className="sp-nav-root">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">

          {/* Logo */}
          <Link to="/" className="sp-nav-logo">
            <span className="sp-nav-logo-dot" />
            splitr
          </Link>

          {/* Desktop nav */}
          <ul className="sp-nav-links-desktop flex items-center gap-6 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`sp-nav-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li><div className="sp-nav-divider" /></li>

            <li>
              <LogoutButton />
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className={`sp-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`sp-mobile-menu ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sp-mobile-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="sp-mobile-logout">
            <LogoutButton />
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar