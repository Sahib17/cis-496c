import { unauthorized } from '@/services/notFound'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Unauthorized = () => {
  const [image, setImage] = useState(null)
  const [imgReady, setImgReady] = useState(false)

  useEffect(() => {
    const fetchImage = async () => {
      const response = await unauthorized()
      setImage(response)
    }
    fetchImage()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Caveat:wght@500;700&family=Outfit:wght@300;400;500&display=swap');

        .ua-root {
          min-height: 100vh;
          background: #f5eee8;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        /* Cross-hatch background — "caution tape" vibe */
        .ua-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, #c8a89a 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.3;
          pointer-events: none;
        }

        .ua-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .ua-blob-1 {
          width: 550px; height: 550px;
          background: rgba(255, 75, 55, 0.08);
          top: -120px; right: -120px;
        }
        .ua-blob-2 {
          width: 420px; height: 420px;
          background: rgba(255, 140, 50, 0.07);
          bottom: -100px; left: -100px;
        }

        /* Caution stripe band — top of page */
        .ua-caution-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: repeating-linear-gradient(
            -45deg,
            #ff4d3d,
            #ff4d3d 10px,
            #0e0f0c 10px,
            #0e0f0c 20px
          );
          z-index: 200;
          animation: slideInBar 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes slideInBar {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }

        .ua-card {
          position: relative;
          z-index: 1;
          background: #fffcf9;
          border: 1.5px solid rgba(0,0,0,0.07);
          border-radius: 32px;
          padding: 3rem 3rem 2.5rem;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow:
            0 2px 0 rgba(0,0,0,0.04),
            0 8px 32px rgba(0,0,0,0.07),
            0 32px 80px rgba(0,0,0,0.05);
          animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Red tape strips instead of lime */
        .ua-tape {
          position: absolute;
          width: 72px; height: 20px;
          background: rgba(255, 77, 61, 0.35);
          border-radius: 3px;
        }
        .ua-tape-1 { top: -10px; left: 60px; transform: rotate(-6deg); }
        .ua-tape-2 { top: -10px; right: 60px; transform: rotate(5deg); }

        /* Lock icon built in CSS */
        .ua-lock-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 0.25rem;
          animation: fadeUp 0.6s 0.1s both;
        }
        .ua-lock {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        .ua-lock-shackle {
          width: 28px; height: 18px;
          border: 3.5px solid #0e0f0c;
          border-bottom: none;
          border-radius: 14px 14px 0 0;
          margin-bottom: -2px;
          position: relative;
          z-index: 1;
        }
        .ua-lock-body {
          width: 44px; height: 34px;
          background: #0e0f0c;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ua-lock-keyhole {
          width: 10px; height: 10px;
          background: #f5eee8;
          border-radius: 50%;
          position: relative;
        }
        .ua-lock-keyhole::after {
          content: '';
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 8px;
          background: #f5eee8;
          border-radius: 0 0 2px 2px;
        }

        .ua-401 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 7rem;
          line-height: 1;
          letter-spacing: -0.06em;
          color: #0e0f0c;
          animation: fadeUp 0.6s 0.15s both;
          position: relative;
          display: inline-block;
        }
        .ua-401 sup {
          font-family: 'Caveat', cursive;
          font-size: 1.1rem;
          font-weight: 500;
          color: #ff4d3d;
          position: absolute;
          top: 14px;
          right: -42px;
          transform: rotate(10deg);
          letter-spacing: 0;
        }

        /* Dog image */
        .ua-dog-wrapper {
          position: relative;
          margin: 1.4rem auto;
          width: 160px; height: 160px;
          animation: fadeUp 0.6s 0.25s both;
        }

        .ua-dog-frame {
          width: 160px; height: 160px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #0e0f0c;
          box-shadow: 4px 4px 0 #0e0f0c;
          background: #e8ddd0;
          position: relative;
        }

        /* Red ring pulse around the frame — "access denied" signal */
        .ua-dog-frame::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(255,77,61,0.35);
          animation: ringPulse 2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes ringPulse {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.04); }
        }

        .ua-dog-img {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0;
          filter: grayscale(20%);
        }
        .ua-dog-img.ready {
          opacity: 1;
          animation: imgReveal 0.5s ease both;
        }
        @keyframes imgReveal {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }

        .ua-dog-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #e8ddd0 25%, #f0e4d8 50%, #e8ddd0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 50%;
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        .ua-dog-badge {
          position: absolute;
          bottom: -4px; right: -8px;
          background: #ff4d3d;
          border: 2px solid #0e0f0c;
          border-radius: 999px;
          padding: 0.2rem 0.6rem;
          font-family: 'Caveat', cursive;
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          box-shadow: 2px 2px 0 #0e0f0c;
          animation: wiggle 2.8s 1.5s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%,100% { transform: rotate(-4deg); }
          50%      { transform: rotate(3deg); }
        }

        .ua-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.55rem;
          letter-spacing: -0.03em;
          color: #0e0f0c;
          margin-bottom: 0.6rem;
          animation: fadeUp 0.6s 0.35s both;
          line-height: 1.2;
        }

        .ua-sub {
          font-size: 0.88rem;
          font-weight: 300;
          color: #7a6e5a;
          line-height: 1.7;
          max-width: 360px;
          margin: 0 auto 1.8rem;
          animation: fadeUp 0.6s 0.45s both;
        }
        .ua-sub strong { font-weight: 500; color: #4a3030; }

        .ua-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.6s 0.55s both;
        }

        .ua-btn-login {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #0e0f0c;
          color: #ff4d3d;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.65rem 1.5rem;
          border-radius: 999px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 3px 3px 0 rgba(0,0,0,0.15);
        }
        .ua-btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 3px 6px 0 rgba(0,0,0,0.15);
        }

        .ua-btn-home {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          color: #7a6e5a;
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
          font-size: 0.85rem;
          padding: 0.65rem 1.3rem;
          border-radius: 999px;
          text-decoration: none;
          border: 1.5px solid rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.18s;
        }
        .ua-btn-home:hover {
          border-color: rgba(0,0,0,0.25);
          color: #0e0f0c;
          background: rgba(0,0,0,0.03);
        }

        .ua-divider {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, transparent, #d0b8b8, transparent);
          margin: 1.8rem auto 1.2rem;
          border-radius: 2px;
        }

        .ua-footer-note {
          font-family: 'Caveat', cursive;
          font-size: 0.95rem;
          color: #b0908a;
          animation: fadeUp 0.6s 0.65s both;
        }

        .ua-logo {
          position: fixed;
          top: 1.5rem; left: 2rem;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.3rem;
          color: #0e0f0c;
          letter-spacing: -0.03em;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          z-index: 10;
          text-decoration: none;
          animation: fadeDown 0.5s both;
        }
        .ua-logo-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #ff4d3d;
          border: 1.5px solid #0e0f0c;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .ua-card { padding: 2.5rem 1.75rem 2rem; }
          .ua-401  { font-size: 5.5rem; }
          .ua-logo { display: none; }
        }
      `}</style>

      <div className="ua-root">
        {/* Caution stripe top bar */}
        <div className="ua-caution-bar" />

        <div className="ua-blob ua-blob-1" />
        <div className="ua-blob ua-blob-2" />

        {/* Logo — dot turns red on this page */}
        <Link to="/" className="ua-logo">
          <span className="ua-logo-dot" />
          splitr
        </Link>

        {/* Main card */}
        <div className="ua-card">
          <div className="ua-tape ua-tape-1" />
          <div className="ua-tape ua-tape-2" />

          {/* Lock icon */}
          <div className="ua-lock-wrap">
            <div className="ua-lock">
              <div className="ua-lock-shackle" />
              <div className="ua-lock-body">
                <div className="ua-lock-keyhole" />
              </div>
            </div>
          </div>

          {/* Big 401 */}
          <div style={{ marginBottom: '0.25rem', marginTop: '0.5rem' }}>
            <span className="ua-401">
              401
              <sup>nope</sup>
            </span>
          </div>

          {/* Dog image */}
          <div className="ua-dog-wrapper">
            <div className="ua-dog-frame">
              {!imgReady && <div className="ua-dog-skeleton" />}
              {image && (
                <img
                  src={image}
                  alt="A stern cat blocking your access"
                  className={`ua-dog-img ${imgReady ? 'ready' : ''}`}
                  onLoad={() => setImgReady(true)}
                />
              )}
            </div>
            <div className="ua-dog-badge">on duty 😾</div>
          </div>

          {/* Copy */}
          <h1 className="ua-headline">You shall not pass.</h1>
          <p className="ua-sub">
            This page is members-only — and this cat is judging you for even trying.<br />
            <strong>Log in to get past the guardian.</strong>
          </p>

          {/* Actions */}
          <div className="ua-actions">
            <Link to="/login" className="ua-btn-login">
              🔑 Log In
            </Link>
            <Link to="/" className="ua-btn-home">
              ← Back to Home
            </Link>
          </div>

          <div className="ua-divider" />
          <p className="ua-footer-note">the cat doesn't care about your feelings. log in.</p>
        </div>
      </div>
    </>
  )
}

export default Unauthorized