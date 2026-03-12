import React, { useEffect, useState } from "react";
import { GetExpenses } from "../services/groupService";
import { Link, useParams } from "react-router-dom";

// ── SPLIT TYPE META ────────────────────────────────────────────────────────────
const splitMeta = {
  EQUAL:      { label: "Equally",    bg: "bg-[#c8f135]/10",  text: "text-[#c8f135]",  border: "border-[#c8f135]/20" },
  SHARES:     { label: "Shares",     bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20" },
  PERCENTAGE: { label: "Percentage", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  EXACT:      { label: "Exact",      bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
};

const getSplitMeta = (type) =>
  splitMeta[type] ?? { label: type ?? "Split", bg: "bg-white/[0.05]", text: "text-[#8a8d70]", border: "border-white/10" };

// ── SKELETON ──────────────────────────────────────────────────────────────────
const SkeletonExpenses = () => (
  <div className="flex flex-col gap-2.5">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-4">
        <div className="skeleton-bar w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton-bar h-3.5 w-1/2 rounded" />
          <div className="skeleton-bar h-2.5 w-1/3 rounded" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="skeleton-bar h-4 w-16 rounded" />
          <div className="skeleton-bar h-2.5 w-12 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ── EXPENSE CARD ──────────────────────────────────────────────────────────────
const ExpenseCard = ({ m, groupId }) => {
  const formattedDate = new Date(m.createdAt).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });

  const totalCents   = m.paidBy?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalDollars = (totalCents / 100).toFixed(2);
  const paidByNames  = m.paidBy?.map((p) => p.user?.name).filter(Boolean).join(", ") || "—";
  const initials     = m.name.slice(0, 2).toUpperCase();
  const split        = getSplitMeta(m.options);

  return (
    <Link
      to={`/groups/${groupId}/expense/${m._id}`}
      className="group flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-4 transition-all duration-200 hover:border-white/[0.14] hover:bg-[#1c1e18] no-underline"
      style={{ textDecoration: "none" }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-[#c8f135] border border-[#c8f135]/20"
        style={{ background: "rgba(200,241,53,0.08)", fontFamily: "'Syne', sans-serif" }}
      >
        {initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[#f0f2e8] text-sm font-semibold truncate"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}
        >
          {m.name}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.62rem] font-semibold border ${split.bg} ${split.text} ${split.border}`}
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            {split.label}
          </span>
          <span className="text-[#4a4d3a] text-xs truncate max-w-[200px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            paid by {paidByNames}
          </span>
        </div>
      </div>

      {/* Amount + date */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span
          className="text-[#f0f2e8] text-sm font-bold"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
        >
          ${totalDollars}
        </span>
        <span className="text-[#3d4030] text-[0.68rem]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {formattedDate}
        </span>
      </div>

      {/* Arrow */}
      <span className="flex-shrink-0 text-[#3d4030] text-sm group-hover:text-[#6b7055] transition-colors ml-1">
        →
      </span>
    </Link>
  );
};

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-14 bg-[#161810] border border-dashed border-white/[0.07] rounded-2xl text-center">
    <span className="text-4xl mb-3">🧾</span>
    <p className="text-[#f0f2e8] text-sm font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
      No expenses yet
    </p>
    <p className="text-[#3d4030] text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
      Add the first expense to start tracking splits.
    </p>
  </div>
);

// ── PAGE ──────────────────────────────────────────────────────────────────────
const Expenses = () => {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Force dark bg on body so nothing bleeds white
  useEffect(() => {
    document.body.style.backgroundColor = "#0e0f0c";
    document.body.style.minHeight = "100vh";
    return () => { document.body.style.backgroundColor = ""; };
  }, []);

  useEffect(() => {
    const getGroupExpenses = async () => {
      const response = await GetExpenses(groupId);
      console.log("axios", response);
      setExpenses(response.expenses.data);
      setLoading(false);
    };
    if (groupId) getGroupExpenses();
  }, [groupId]);

  useEffect(() => {
    console.log("updated expenses:", expenses);
  }, [expenses]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500&display=swap');

        @keyframes expFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .exp-card { animation: expFadeUp 0.4s both; }
        .exp-card:nth-child(1)   { animation-delay: 0.04s; }
        .exp-card:nth-child(2)   { animation-delay: 0.09s; }
        .exp-card:nth-child(3)   { animation-delay: 0.14s; }
        .exp-card:nth-child(4)   { animation-delay: 0.19s; }
        .exp-card:nth-child(5)   { animation-delay: 0.24s; }
        .exp-card:nth-child(6)   { animation-delay: 0.29s; }
        .exp-card:nth-child(n+7) { animation-delay: 0.34s; }

        .skeleton-bar {
          background: linear-gradient(90deg, #1a1c17 25%, #22241c 50%, #1a1c17 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 1.4s infinite;
        }
        @keyframes skeletonShimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        .exp-page-fade { animation: expFadeUp 0.5s 0.05s both; }
      `}</style>

      {/* Dark full-page shell */}
      <div className="min-h-screen bg-[#0e0f0c]" style={{ fontFamily: "'Outfit', sans-serif" }}>

        {/* Dot grid */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(200,241,53,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">

          {/* Page header */}
          <div className="exp-page-fade mb-8">
            <p
              className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-[#c8f135] mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Group expenses
            </p>
            <h1
              className="text-[#f0f2e8] text-3xl font-extrabold leading-tight"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.04em" }}
            >
              Expenses
            </h1>
            <p className="text-[#4a4d3a] text-sm mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Every split, tracked in one place.
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <SkeletonExpenses />
          ) : expenses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-2.5">
              {expenses.map((m) => (
                <div key={m._id} className="exp-card">
                  <ExpenseCard m={m} groupId={groupId} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Expenses;