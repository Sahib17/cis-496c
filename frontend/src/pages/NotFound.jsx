import { notFound } from '@/services/notFound'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  const [image, setImage] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [imgReady, setImgReady] = useState(false)
  loaded;
  useEffect(() => {
    const fetchImage = async () => {
      const response = await notFound()
      setImage(response)
      setLoaded(true)
    }
    fetchImage()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Caveat:wght@500;700&family=Outfit:wght@300;400;500&display=swap');

        .nf-root {
          min-height: 100vh;
          background: #f5f0e8;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        /* Subtle dot-grid background */
        .nf-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, #c8b89a 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.35;
          pointer-events: none;
        }

        /* Decorative blobs */
        .nf-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .nf-blob-1 {
          width: 500px; height: 500px;
          background: rgba(200,241,53,0.12);
          top: -100px; right: -100px;
        }
        .nf-blob-2 {
          width: 400px; height: 400px;
          background: rgba(255,180,80,0.1);
          bottom: -80px; left: -80px;
        }

        .nf-card {
          position: relative;
          z-index: 1;
          background: #fffef9;
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

        /* Tape strips (decorative) */
        .nf-tape {
          position: absolute;
          width: 72px; height: 20px;
          background: rgba(200,241,53,0.6);
          border-radius: 3px;
          opacity: 0.8;
        }
        .nf-tape-1 { top: -10px; left: 60px; transform: rotate(-6deg); }
        .nf-tape-2 { top: -10px; right: 60px; transform: rotate(5deg); }

        .nf-404 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 7rem;
          line-height: 1;
          letter-spacing: -0.06em;
          color: #0e0f0c;
          margin-bottom: 0;
          animation: fadeUp 0.6s 0.15s both;
          position: relative;
          display: inline-block;
        }
        .nf-404 sup {
          font-family: 'Caveat', cursive;
          font-size: 1.1rem;
          font-weight: 500;
          color: #b0915a;
          position: absolute;
          top: 14px;
          right: -36px;
          transform: rotate(12deg);
          letter-spacing: 0;
        }

        .nf-dog-wrapper {
          position: relative;
          margin: 1.4rem auto;
          width: 160px; height: 160px;
          animation: fadeUp 0.6s 0.25s both;
        }

        .nf-dog-frame {
          width: 160px; height: 160px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #0e0f0c;
          box-shadow: 4px 4px 0 #0e0f0c;
          background: #e8e0d0;
          position: relative;
        }

        .nf-dog-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
          opacity: 0;
        }
        .nf-dog-img.ready { opacity: 1; animation: imgReveal 0.5s ease both; }
        @keyframes imgReveal {
          from { opacity: 0; transform: scale(1.05); }
          to   { opacity: 1; transform: scale(1); }
        }

        .nf-dog-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #e8e0d0 25%, #f0e8d8 50%, #e8e0d0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 50%;
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        .nf-dog-badge {
          position: absolute;
          bottom: -4px; right: -4px;
          background: #c8f135;
          border: 2px solid #0e0f0c;
          border-radius: 999px;
          padding: 0.2rem 0.6rem;
          font-family: 'Caveat', cursive;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0e0f0c;
          white-space: nowrap;
          box-shadow: 2px 2px 0 #0e0f0c;
          animation: wiggle 2.5s 1.5s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%,100% { transform: rotate(-3deg); }
          50%      { transform: rotate(4deg); }
        }

        .nf-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.55rem;
          letter-spacing: -0.03em;
          color: #0e0f0c;
          margin-bottom: 0.6rem;
          animation: fadeUp 0.6s 0.35s both;
          line-height: 1.2;
        }

        .nf-sub {
          font-size: 0.88rem;
          font-weight: 300;
          color: #7a6e5a;
          line-height: 1.7;
          max-width: 360px;
          margin: 0 auto 1.8rem;
          animation: fadeUp 0.6s 0.45s both;
        }
        .nf-sub strong { font-weight: 500; color: #4a4030; }

        .nf-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.6s 0.55s both;
        }

        .nf-btn-home {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #0e0f0c;
          color: #c8f135;
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
        .nf-btn-home:hover {
          transform: translateY(-2px);
          box-shadow: 3px 6px 0 rgba(0,0,0,0.15);
        }

        .nf-btn-back {
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
        .nf-btn-back:hover {
          border-color: rgba(0,0,0,0.25);
          color: #0e0f0c;
          background: rgba(0,0,0,0.03);
        }

        .nf-divider {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, transparent, #d0c8b8, transparent);
          margin: 1.8rem auto 1.2rem;
          border-radius: 2px;
        }

        .nf-footer-note {
          font-family: 'Caveat', cursive;
          font-size: 0.95rem;
          color: #b0a08a;
          animation: fadeUp 0.6s 0.65s both;
        }

        .nf-logo {
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
        .nf-logo-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #c8f135;
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
          .nf-card { padding: 2.5rem 1.75rem 2rem; }
          .nf-404 { font-size: 5.5rem; }
          .nf-logo { display: none; }
        }
      `}</style>

      <div className="nf-root">
        <div className="nf-blob nf-blob-1" />
        <div className="nf-blob nf-blob-2" />

        {/* Logo */}
        <Link to="/" className="nf-logo">
          <span className="nf-logo-dot" />
          splitr
        </Link>

        {/* Main card */}
        <div className="nf-card">
          <div className="nf-tape nf-tape-1" />
          <div className="nf-tape nf-tape-2" />

          {/* Big 404 */}
          <div style={{ marginBottom: '0.25rem' }}>
            <span className="nf-404">
              404
              <sup>oops</sup>
            </span>
          </div>

          {/* Dog image */}
          <div className="nf-dog-wrapper">
            <div className="nf-dog-frame">
              {!imgReady && <div className="nf-dog-skeleton" />}
              {image && (
                <img
                  src={image}
                  alt="A confused dog who also can't find the page"
                  className={`nf-dog-img ${imgReady ? 'ready' : ''}`}
                  onLoad={() => setImgReady(true)}
                />
              )}
            </div>
            <div className="nf-dog-badge">also lost 🐾</div>
          </div>

          {/* Copy */}
          <h1 className="nf-headline">This page ran off.</h1>
          <p className="nf-sub">
            Like this dog, the page you're looking for seems to have wandered somewhere it shouldn't.<br />
            <strong>Even we can't find it.</strong>
          </p>

          {/* Actions */}
          <div className="nf-actions">
            <Link to="/" className="nf-btn-home">
              ← Back to Splitr
            </Link>
            <button
              className="nf-btn-back"
              onClick={() => window.history.back()}
            >
              Go back
            </button>
          </div>

          <div className="nf-divider" />
          <p className="nf-footer-note">at least the dog is cute, right?</p>
        </div>
      </div>
    </>
  )
}

export default NotFound