import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SPLITS = [
  { name: "Weekend Cabin 🏕️", amount: 340.0, people: ["Alex", "Jordan", "Sam", "Riley"], you: -85.0 },
  { name: "Tokyo Trip ✈️", amount: 2840.5, people: ["Mia", "You", "Chris"], you: 946.83 },
  { name: "Dinner at Nobu 🍣", amount: 420.0, people: ["You", "Dana", "Lee"], you: -280.0 },
];

const FEATURES = [
  { icon: "⚡", title: "Instant Splits", desc: "Add an expense in seconds. Splitr handles the math so you never pull out a calculator again." },
  { icon: "🔗", title: "Group Expenses", desc: "Trips, dinners, rent — organize expenses into groups with running balances visible to all." },
  { icon: "💸", title: "Smart Settle Up", desc: "Minimizes the number of transactions needed to settle everyone. One tap, done." },
  { icon: "📊", title: "Spend Insights", desc: "See where your shared money goes with beautiful breakdowns by category and person." },
  { icon: "🔔", title: "Gentle Reminders", desc: "Splitr nudges friends who owe you — so you never have to have that awkward conversation." },
  { icon: "🔒", title: "Private & Secure", desc: "Your financial data is encrypted end-to-end. We never sell your data. Ever." },
];

const TESTIMONIALS = [
  { text: "We use Splitr for our 6-person house. Zero drama, zero spreadsheets.", name: "Maya R.", handle: "@maya_r" },
  { text: "Went on a 3-week trip to Japan with 4 friends. Splitr made it seamless.", name: "Jonah K.", handle: "@jonahk" },
  { text: "The settle-up feature alone is worth it. Genius UX.", name: "Priya S.", handle: "@priya_s" },
];

const Counter = ({ end, prefix = "", suffix = "", duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

const BillCard = ({ split, delay }) => (
  <div className="bill-card" style={{ animationDelay: `${delay}s` }}>
    <div className="bill-card-top">
      <span className="bill-name">{split.name}</span>
      <span className="bill-total">${split.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
    </div>
    <div className="bill-avatars">
      {split.people.map((p) => (
        <div key={p} className="avatar" title={p}>{p[0]}</div>
      ))}
    </div>
    <div className="bill-footer">
      <span className="bill-label">Your share</span>
      <span className={`bill-share ${split.you < 0 ? "owe" : "owed"}`}>
        {split.you < 0 ? `you owe $${Math.abs(split.you).toFixed(2)}` : `you get $${split.you.toFixed(2)}`}
      </span>
    </div>
  </div>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500&display=swap');

        :root {
          --lime: #c8f135;
          --lime-dark: #a8d020;
          --ink: #0e0f0c;
          --ink2: #1a1c17;
          --ink3: #242720;
          --fog: #f0f2e8;
          --fog2: #e4e8d8;
          --muted: #6b7055;
          --red: #ff4d3d;
          --green: #22c55e;
          --card-bg: #161810;
          --radius: 20px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sp-root {
          font-family: 'Outfit', sans-serif;
          background: var(--ink);
          color: var(--fog);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .sp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          transition: background 0.4s, backdrop-filter 0.4s, border-color 0.4s;
          border-bottom: 1px solid transparent;
        }
        .sp-nav.scrolled {
          background: rgba(14,15,12,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-color: rgba(255,255,255,0.06);
        }

        .sp-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--fog);
          letter-spacing: -0.03em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .sp-logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--lime);
          display: inline-block;
          margin-bottom: 2px;
        }
        .sp-nav-right { display: flex; gap: 0.6rem; align-items: center; }

        .btn-ghost-nav {
          background: transparent !important;
          color: var(--muted) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 0.82rem !important;
          font-weight: 500 !important;
          padding: 0.45rem 1.1rem !important;
          border-radius: 999px !important;
          transition: all 0.2s !important;
          text-decoration: none !important;
        }
        .btn-ghost-nav:hover {
          color: var(--fog) !important;
          border-color: rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.04) !important;
        }
        .btn-lime {
          background: var(--lime) !important;
          color: var(--ink) !important;
          border: none !important;
          font-family: 'Syne', sans-serif !important;
          font-size: 0.82rem !important;
          font-weight: 700 !important;
          padding: 0.5rem 1.3rem !important;
          border-radius: 999px !important;
          transition: all 0.2s !important;
          letter-spacing: 0.01em !important;
        }
        .btn-lime:hover {
          background: var(--lime-dark) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 24px rgba(200,241,53,0.25) !important;
        }

        .sp-hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          padding: 8rem 2.5rem 5rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .sp-hero { grid-template-columns: 1fr; padding-top: 7rem; }
          .sp-hero-visual { display: none; }
        }

        .sp-hero-left { display: flex; flex-direction: column; gap: 2rem; }

        .sp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(200,241,53,0.1);
          border: 1px solid rgba(200,241,53,0.2);
          color: var(--lime);
          font-size: 0.72rem;
          font-weight: 500;
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          width: fit-content;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          animation: fadeUp 0.7s 0.1s both;
        }
        .sp-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--lime);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .sp-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(3rem, 5.5vw, 5.2rem);
          line-height: 1.0;
          letter-spacing: -0.04em;
          color: var(--fog);
          animation: fadeUp 0.7s 0.2s both;
        }
        .sp-h1 em {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
          color: var(--lime);
        }

        .sp-hero-sub {
          font-size: 1.05rem;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          max-width: 440px;
          animation: fadeUp 0.7s 0.32s both;
        }

        .sp-hero-cta {
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: fadeUp 0.7s 0.44s both;
          flex-wrap: wrap;
        }

        .btn-lime-lg {
          background: var(--lime) !important;
          color: var(--ink) !important;
          border: none !important;
          font-family: 'Syne', sans-serif !important;
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          padding: 0.8rem 2rem !important;
          border-radius: 999px !important;
          transition: all 0.22s !important;
        }
        .btn-lime-lg:hover {
          background: var(--lime-dark) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 32px rgba(200,241,53,0.3) !important;
        }
        .btn-outline-lg {
          background: transparent !important;
          color: var(--fog) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 0.9rem !important;
          font-weight: 400 !important;
          padding: 0.8rem 1.8rem !important;
          border-radius: 999px !important;
          transition: all 0.22s !important;
        }
        .btn-outline-lg:hover {
          border-color: rgba(255,255,255,0.3) !important;
          background: rgba(255,255,255,0.04) !important;
        }

        .sp-hero-trust {
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: fadeUp 0.7s 0.55s both;
        }
        .sp-avatars-row { display: flex; }
        .sp-avatar-sm {
          width: 30px; height: 30px;
          border-radius: 50%;
          border: 2px solid var(--ink);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--fog);
          margin-left: -8px;
        }
        .sp-avatar-sm:first-child { margin-left: 0; }
        .sp-trust-text { font-size: 0.78rem; color: var(--muted); line-height: 1.4; }
        .sp-trust-text strong { color: var(--fog); font-weight: 500; }

        .sp-hero-visual {
          position: relative;
          height: 520px;
          animation: fadeUp 0.8s 0.5s both;
        }

        .bill-card {
          position: absolute;
          background: var(--card-bg);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: var(--radius);
          padding: 1.4rem 1.6rem;
          width: 280px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          animation: floatCard 6s ease-in-out infinite;
        }
        .bill-card:nth-child(1) { top: 30px; left: 40px; }
        .bill-card:nth-child(2) { top: 160px; right: 0; }
        .bill-card:nth-child(3) { bottom: 40px; left: 60px; }

        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .bill-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .bill-name { font-size: 0.85rem; font-weight: 500; color: var(--fog); }
        .bill-total { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; color: var(--fog); }
        .bill-avatars { display: flex; gap: 0.35rem; margin-bottom: 1rem; }
        .avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--ink3);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--fog2);
        }
        .bill-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .bill-label { font-size: 0.7rem; color: var(--muted); }
        .bill-share { font-size: 0.78rem; font-weight: 600; }
        .bill-share.owe { color: var(--red); }
        .bill-share.owed { color: var(--green); }

        .sp-stats {
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: var(--ink2);
        }
        .sp-stat {
          padding: 2.8rem 2rem;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .sp-stat:last-child { border-right: none; }
        .sp-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 800;
          color: var(--lime);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .sp-stat-label { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.02em; }

        .sp-features-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 7rem 2.5rem;
        }
        .sp-section-tag {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lime);
          margin-bottom: 1.2rem;
        }
        .sp-section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4vw, 3.2rem);
          letter-spacing: -0.04em;
          color: var(--fog);
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .sp-section-title em {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
          color: var(--lime);
        }
        .sp-section-sub {
          font-size: 0.95rem;
          color: var(--muted);
          max-width: 480px;
          line-height: 1.7;
          margin-bottom: 3.5rem;
        }
        .sp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          overflow: hidden;
        }
        .sp-feature-card {
          background: var(--ink2);
          padding: 2.2rem 2rem;
          transition: background 0.25s;
          position: relative;
          overflow: hidden;
        }
        .sp-feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(200,241,53,0.06), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .sp-feature-card:hover { background: #1e2018; }
        .sp-feature-card:hover::before { opacity: 1; }
        .sp-feature-icon { font-size: 1.8rem; margin-bottom: 1.2rem; display: block; }
        .sp-feature-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--fog);
          margin-bottom: 0.55rem;
        }
        .sp-feature-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.7; }

        .sp-how-section {
          background: var(--ink2);
          padding: 7rem 2.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sp-how-inner { max-width: 1280px; margin: 0 auto; }
        .sp-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          margin-top: 3.5rem;
        }
        .sp-step { display: flex; flex-direction: column; gap: 1rem; }
        .sp-step-num {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 3.5rem;
          color: rgba(200,241,53,0.12);
          line-height: 1;
          letter-spacing: -0.05em;
        }
        .sp-step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; color: var(--fog); }
        .sp-step-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.7; }

        .sp-testimonials-section { max-width: 1280px; margin: 0 auto; padding: 7rem 2.5rem; }
        .sp-testi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 3.5rem;
        }
        .sp-testi-card {
          background: var(--card-bg);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 2rem;
          transition: border-color 0.25s, transform 0.25s;
        }
        .sp-testi-card:hover { border-color: rgba(200,241,53,0.2); transform: translateY(-4px); }
        .sp-testi-quote { font-size: 0.9rem; color: var(--fog2); line-height: 1.7; margin-bottom: 1.5rem; }
        .sp-testi-author { display: flex; align-items: center; gap: 0.75rem; }
        .sp-testi-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--ink3), #2a2e20);
          border: 1px solid rgba(200,241,53,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--lime);
        }
        .sp-testi-name { font-weight: 600; font-size: 0.82rem; color: var(--fog); }
        .sp-testi-handle { font-size: 0.72rem; color: var(--muted); }

        .sp-cta-section {
          background: var(--lime);
          padding: 7rem 2.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .sp-cta-bg {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(0,0,0,0.025) 40px, rgba(0,0,0,0.025) 41px);
        }
        .sp-cta-inner {
          position: relative; z-index: 1;
          max-width: 620px;
          margin: 0 auto;
          display: flex; flex-direction: column; align-items: center;
          gap: 1.8rem;
        }
        .sp-cta-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.4rem, 5vw, 4rem);
          letter-spacing: -0.04em;
          color: var(--ink);
          line-height: 1.05;
        }
        .sp-cta-title em {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
        }
        .sp-cta-sub { font-size: 0.95rem; color: rgba(14,15,12,0.6); line-height: 1.6; }
        .sp-cta-btns { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

        .btn-ink {
          background: var(--ink) !important;
          color: var(--lime) !important;
          border: none !important;
          font-family: 'Syne', sans-serif !important;
          font-weight: 700 !important;
          font-size: 0.92rem !important;
          padding: 0.8rem 2rem !important;
          border-radius: 999px !important;
          transition: all 0.22s !important;
        }
        .btn-ink:hover {
          background: #1a1c17 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.3) !important;
        }
        .btn-outline-ink {
          background: transparent !important;
          color: var(--ink) !important;
          border: 1.5px solid rgba(14,15,12,0.3) !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 0.9rem !important;
          padding: 0.8rem 1.8rem !important;
          border-radius: 999px !important;
          transition: all 0.22s !important;
        }
        .btn-outline-ink:hover {
          border-color: var(--ink) !important;
          background: rgba(14,15,12,0.07) !important;
        }

        .sp-footer {
          background: var(--ink);
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 2.5rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .sp-footer-copy { font-size: 0.76rem; color: #3a3d30; }
        .sp-footer-links { display: flex; gap: 1.5rem; }
        .sp-footer-link { font-size: 0.76rem; color: #3a3d30; text-decoration: none; transition: color 0.2s; }
        .sp-footer-link:hover { color: var(--muted); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .sp-nav { padding: 1rem 1.25rem; }
          .sp-stats { grid-template-columns: 1fr; }
          .sp-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .sp-stat:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="sp-root">

        {/* NAV */}
        <nav className={`sp-nav ${scrolled ? "scrolled" : ""}`}>
          <div className="sp-logo">
            <span className="sp-logo-dot" />
            splitr
          </div>
          <div className="sp-nav-right">
            <Link to="/login">
              <Button className="btn-ghost-nav" variant="ghost">Log In</Button>
            </Link>
            <Link to="/register">
              <Button className="btn-lime">Get Started Free</Button>
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="sp-hero">
          <div className="sp-hero-left">
            <div className="sp-badge">
              <span className="sp-badge-dot" />
              No more awkward IOUs
            </div>

            <h1 className="sp-h1">
              Split bills.<br />
              Not <em>friendships.</em>
            </h1>

            <p className="sp-hero-sub">
              Splitr makes shared expenses effortless — whether you're splitting rent, a trip to Bali, or last night's dinner. Track, settle, and move on.
            </p>

            <div className="sp-hero-cta">
              <Link to="/register">
                <Button className="btn-lime-lg">Start for Free →</Button>
              </Link>
              <Link to="/login">
                <Button className="btn-outline-lg">Sign In</Button>
              </Link>
            </div>

            <div className="sp-hero-trust">
              <div className="sp-avatars-row">
                {[
                  { l: "A", bg: "#2a3020" },
                  { l: "B", bg: "#1e2820" },
                  { l: "C", bg: "#24201e" },
                  { l: "D", bg: "#201e2a" },
                  { l: "E", bg: "#1e2420" },
                ].map(({ l, bg }) => (
                  <div key={l} className="sp-avatar-sm" style={{ background: bg }}>{l}</div>
                ))}
              </div>
              <p className="sp-trust-text">
                <strong>50,000+</strong> people use Splitr<br />to keep friendships intact
              </p>
            </div>
          </div>

          <div className="sp-hero-visual">
            {SPLITS.map((s, i) => (
              <BillCard key={i} split={s} delay={i * 0.2} />
            ))}
          </div>
        </section>

        {/* STATS */}
        <div className="sp-stats">
          {[
            { end: 50000, suffix: "+", label: "Active Users" },
            { end: 4200000, prefix: "$", label: "Settled This Month" },
            { end: 99, suffix: "%", label: "Less Drama, Guaranteed" },
          ].map((s, i) => (
            <div className="sp-stat" key={i}>
              <div className="sp-stat-num">
                <Counter end={s.end} prefix={s.prefix || ""} suffix={s.suffix || ""} />
              </div>
              <div className="sp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section className="sp-features-section">
          <p className="sp-section-tag">Everything you need</p>
          <h2 className="sp-section-title">Built for <em>real life</em></h2>
          <p className="sp-section-sub">
            Splitr handles the complexity of shared finances — so you can focus on making memories, not managing spreadsheets.
          </p>
          <div className="sp-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="sp-feature-card">
                <span className="sp-feature-icon">{f.icon}</span>
                <div className="sp-feature-title">{f.title}</div>
                <div className="sp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="sp-how-section">
          <div className="sp-how-inner">
            <p className="sp-section-tag">How it works</p>
            <h2 className="sp-section-title">Three steps to <em>zero debt</em></h2>
            <div className="sp-steps">
              {[
                { n: "01", t: "Create a Group", d: "Add your friends to a trip, household, or event. They get a link to join instantly — no signup required." },
                { n: "02", t: "Log Expenses", d: "Add any expense in seconds. Splitr auto-calculates who owes what based on how you split it." },
                { n: "03", t: "Settle Up", d: "When it's time to settle, Splitr finds the simplest path to clear all debts. Pay once and you're done." },
              ].map((s) => (
                <div key={s.n} className="sp-step">
                  <div className="sp-step-num">{s.n}</div>
                  <div className="sp-step-title">{s.t}</div>
                  <div className="sp-step-desc">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sp-testimonials-section">
          <p className="sp-section-tag">Loved by users</p>
          <h2 className="sp-section-title">Don't take our <em>word</em> for it</h2>
          <div className="sp-testi-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="sp-testi-card">
                <p className="sp-testi-quote">"{t.text}"</p>
                <div className="sp-testi-author">
                  <div className="sp-testi-avatar">{t.name[0]}</div>
                  <div>
                    <div className="sp-testi-name">{t.name}</div>
                    <div className="sp-testi-handle">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="sp-cta-section">
          <div className="sp-cta-bg" />
          <div className="sp-cta-inner">
            <h2 className="sp-cta-title">
              Money talk<br />made <em>easy.</em>
            </h2>
            <p className="sp-cta-sub">
              Join thousands of people who use Splitr to keep finances fair and friendships strong. Free forever for the basics.
            </p>
            <div className="sp-cta-btns">
              <Link to="/register">
                <Button className="btn-ink">Create Free Account</Button>
              </Link>
              <Link to="/login">
                <Button className="btn-outline-ink">Already have an account?</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="sp-footer">
          <div className="sp-logo" style={{ fontSize: '1.1rem' }}>
            <span className="sp-logo-dot" />
            splitr
          </div>
          <span className="sp-footer-copy">© 2026 Splitr. Split bills, not friendships.</span>
          <div className="sp-footer-links">
            <a href="#" className="sp-footer-link">Privacy</a>
            <a href="#" className="sp-footer-link">Terms</a>
            <a href="#" className="sp-footer-link">Contact</a>
          </div>
        </footer>

      </div>
    </>
  );
}