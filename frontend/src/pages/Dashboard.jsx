import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

// ── SKELETON ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-[#161810] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4">
    <div className="skeleton-bar h-3 w-24 rounded" />
    <div className="skeleton-bar h-10 w-36 rounded-lg" />
    <div className="skeleton-bar h-2.5 w-40 rounded mt-1" />
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-4">
    <div className="skeleton-bar w-9 h-9 rounded-xl shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="skeleton-bar h-3 w-1/2 rounded" />
      <div className="skeleton-bar h-2.5 w-1/3 rounded" />
    </div>
    <div className="skeleton-bar h-4 w-16 rounded shrink-0" />
  </div>
);

// ── BALANCE CARD ──────────────────────────────────────────────────────────────
const BalanceCard = ({ label, amount, color, icon, delay }) => (
  <div
    className="relative overflow-hidden bg-[#161810] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:border-white/13"
    style={{ animation: `dashFadeUp 0.5s ${delay}s both` }}
  >
    {/* subtle radial glow behind the number */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 10% 90%, ${color}10 0%, transparent 70%)`,
      }}
    />
    <p
      className="text-[0.65rem] font-semibold tracking-[0.16em] uppercase relative z-10"
      style={{ fontFamily: "'Outfit', sans-serif", color: "#4a4d3a" }}
    >
      {label}
    </p>
    <p
      className="text-5xl font-extrabold leading-none relative z-10"
      style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.04em", color }}
    >
      <span className="text-2xl font-bold mr-0.5" style={{ opacity: 0.7 }}>$</span>
      {(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
    <span className="text-2xl absolute bottom-5 right-6 opacity-10 select-none" style={{ fontSize: "3rem" }}>
      {icon}
    </span>
  </div>
);

// ── EXPENSE ROW ───────────────────────────────────────────────────────────────
const ExpenseRow = ({ expense, userId }) => {
  const myMember = expense.members?.find(
    (m) => (m.user?._id ?? m.user)?.toString() === userId?.toString()
  );
  const myPaid = expense.paidBy?.find(
    (p) => (p.user?._id ?? p.user)?.toString() === userId?.toString()
  );

  const iOwe   = myMember?.amountOwed ?? 0;
  const iPaid  = myPaid?.amount ?? 0;
  const balance = iPaid - iOwe;

  const isPositive = balance > 0;
  const isNeutral  = balance === 0;
  const color      = isNeutral ? "#4a4d3a" : isPositive ? "#c8f135" : "#ff6b6b";
  const label      = isNeutral ? "settled" : isPositive
    ? `+$${(balance.toFixed(2)) / 100}`
    : `-$${Math.abs(balance / 100).toFixed(2)}`;

  const paidByNames = expense.paidBy
    ?.map((p) => p.user?.name ?? "?")
    .filter(Boolean)
    .join(", ") || "—";

  const initials = (expense.name ?? "EX").slice(0, 2).toUpperCase();

  return (
    <Link
      to={`/groups/${expense.groupId}/expense/${expense._id}`}
      className="group flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-3.5 transition-all duration-200 hover:border-white/[0.14] hover:bg-[#1c1e18] no-underline"
      style={{ textDecoration: "none" }}
    >
      <div
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-[#c8f135] border border-[#c8f135]/20"
        style={{ background: "rgba(200,241,53,0.07)", fontFamily: "'Syne', sans-serif" }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[#f0f2e8] text-sm font-semibold truncate"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}
        >
          {expense.name}
        </p>
        <p className="text-[#4a4d3a] text-xs mt-0.5 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
          paid by {paidByNames}
        </p>
      </div>

      <span
        className="shrink-0 text-sm font-bold"
        style={{ fontFamily: "'Syne', sans-serif", color, letterSpacing: "-0.02em" }}
      >
        {label}
      </span>

      <span className="shrink-0 text-[#3d4030] text-sm group-hover:text-[#6b7055] transition-colors ml-1">
        →
      </span>
    </Link>
  );
};

// ── GROUP SUMMARY ROW ─────────────────────────────────────────────────────────
const GroupRow = ({ group, balance, delay }) => {
  const name     = group.groupId?.name ?? "Unknown Group";
  const initials = name.slice(0, 2).toUpperCase();
  const isPos    = balance > 0;
  const isZero   = balance === 0;
  const color    = isZero ? "#4a4d3a" : isPos ? "#c8f135" : "#ff6b6b";
  const label    = isZero
    ? "settled up"
    : isPos
    ? `you're owed $${balance.toFixed(2)}`
    : `you owe $${Math.abs(balance).toFixed(2)}`;

  return (
    <Link
      to={`/groups/${group.groupId?._id}`}
      className="flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-3.5 transition-all duration-200 hover:border-white/13 hover:bg-[#1a1c14] no-underline"
      style={{ textDecoration: "none", animation: `dashFadeUp 0.45s ${delay}s both` }}
    >
      <div
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-[#c8f135] border border-[#c8f135]/20"
        style={{ background: "rgba(200,241,53,0.07)", fontFamily: "'Syne', sans-serif" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[#f0f2e8] text-sm font-semibold truncate"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}
        >
          {name}
        </p>
        <p className="text-xs mt-0.5" style={{ fontFamily: "'Outfit', sans-serif", color }}>
          {label}
        </p>
      </div>
      <span className="text-[#3d4030] text-sm hover:text-[#6b7055] transition-colors">→</span>
    </Link>
  );
};

// ── PAGE ──────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const userId = user?.sub; // JWT payload has `sub` as the user ID

  const [balances, setBalances]     = useState(null);
  const [groups, setGroups]         = useState([]);
  const [recentExp, setRecentExp]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);

        // 1. Fetch dashboard totals
        const dashRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/groups/dashboard`,
          { withCredentials: true }
        );
        setBalances(dashRes.data.data);

        // 2. Fetch all joined groups
        const grpRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/groups`,
          { withCredentials: true }
        );
        const allGroups = Array.isArray(grpRes.data) ? grpRes.data : [];
        const joined = allGroups.filter((g) => g.status === "JOINED" && g.groupId?.type === "GROUP");
        setGroups(joined);

        // 3. Fetch recent expenses from all joined groups (parallel, first 3 groups)
        const topGroups = joined.slice(0, 3);
        const expPromises = topGroups.map((g) =>
          axios.get(
            `${import.meta.env.VITE_API_URL}/groups/${g.groupId._id}/expenses`,
            { withCredentials: true }
          ).then((r) => r.data.data ?? []).catch(() => [])
        );
        const expResults = await Promise.all(expPromises);

        // Flatten, tag with groupId, sort by date, take top 5
        const allExpenses = expResults
          .flatMap((arr, i) =>
            arr.map((e) => ({ ...e, groupId: topGroups[i].groupId._id }))
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentExp(allExpenses);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  // Compute per-group balance from fetched expenses
  const groupBalances = groups.map((g) => {
    const groupExpenses = recentExp.filter(
      (e) => e.groupId?.toString() === g.groupId?._id?.toString()
    );
    const balance = groupExpenses.reduce((sum, exp) => {
      const myMember = exp.members?.find(
        (m) => (m.user?._id ?? m.user)?.toString() === userId?.toString()
      );
      const myPaid = exp.paidBy?.find(
        (p) => (p.user?._id ?? p.user)?.toString() === userId?.toString()
      );
      return sum + ((myPaid?.amount ?? 0) - (myMember?.amountOwed ?? 0));
    }, 0);
    return { group: g, balance: +balance.toFixed(2) };
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500&display=swap');

        @keyframes dashFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .skeleton-bar {
          background: linear-gradient(90deg, #1a1c17 25%, #22241c 50%, #1a1c17 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 1.4s infinite;
          border-radius: 10px;
        }
        @keyframes skeletonShimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
      `}</style>

      <div className="min-h-screen bg-[#0e0f0c]" style={{ fontFamily: "'Outfit', sans-serif" }}>

        {/* dot-grid background */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(200,241,53,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 flex flex-col gap-10">

          {/* ── HEADER ── */}
          <div style={{ animation: "dashFadeUp 0.45s 0.0s both" }}>
            <p
              className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-[#c8f135] mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Overview
            </p>
            <h1
              className="text-[#f0f2e8] text-3xl font-extrabold leading-tight"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.04em" }}
            >
              Dashboard
            </h1>
            <p className="text-[#4a4d3a] text-sm mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Your financial snapshot across all groups.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── BALANCE CARDS ── */}
          <div className="grid grid-cols-2 gap-3">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <BalanceCard
                  label="You are owed"
                  amount={balances?.youAreOwed ?? 0}
                  color="#c8f135"
                  icon="↑"
                  delay={0.08}
                />
                <BalanceCard
                  label="You owe"
                  amount={balances?.youOwe ?? 0}
                  color="#ff6b6b"
                  icon="↓"
                  delay={0.14}
                />
              </>
            )}
          </div>

          {/* ── RECENT ACTIVITY ── */}
          <div style={{ animation: "dashFadeUp 0.45s 0.22s both" }}>
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-[#f0f2e8] text-base font-bold"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
              >
                Recent Expenses
              </h2>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/6 text-[#6b7055] text-[0.65rem] font-semibold">
                {recentExp.length}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {loading ? (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
              </div>
            ) : recentExp.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-[#161810] border border-dashed border-white/[0.07] rounded-2xl text-center">
                <span className="text-3xl mb-3">🧾</span>
                <p className="text-[#3d4030] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  No recent expenses. Add one from a group!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentExp.map((exp) => (
                  <ExpenseRow key={exp._id} expense={exp} userId={userId} />
                ))}
              </div>
            )}
          </div>

          {/* ── GROUP BALANCES ── */}
          <div style={{ animation: "dashFadeUp 0.45s 0.3s both" }}>
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-[#f0f2e8] text-base font-bold"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
              >
                Your Groups
              </h2>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/6 text-[#6b7055] text-[0.65rem] font-semibold">
                {groups.length}
              </span>
              <div className="flex-1 h-px bg-white/5" />
              <Link
                to="/groups"
                className="text-[0.72rem] font-semibold text-[#6b7055] hover:text-[#c8f135] transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                See all →
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2.5">
                {[1, 2].map((i) => <SkeletonRow key={i} />)}
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-[#161810] border border-dashed border-white/[0.07] rounded-2xl text-center">
                <span className="text-3xl mb-3">🏠</span>
                <p className="text-[#3d4030] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  No groups yet.{" "}
                  <Link to="/groups" className="text-[#6b7055] hover:text-[#c8f135] transition-colors underline">
                    Create one!
                  </Link>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {groupBalances.map(({ group, balance }, i) => (
                  <GroupRow
                    key={group.groupId?._id}
                    group={group}
                    balance={(balance) / 100}
                    delay={0.03 * i}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;