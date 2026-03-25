import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const splitColors = {
  EQUALLY:    { bg: "bg-[#c8f135]/10",  text: "text-[#c8f135]",  border: "border-[#c8f135]/20",  label: "Equally" },
  SHARES:     { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20",   label: "Shares" },
  PERCENTAGE: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", label: "Percentage" },
  UNEQUALLY:  { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", label: "Unequally" },
  ADJUSTMENT: { bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/20",   label: "Adjustment" },
};

const ExpenseDetail = () => {
  const { groupId, expenseId } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await axios.get(`${API_URL}/expenses/${expenseId}`, { withCredentials: true });
        setExpense(res.data.data);
      } catch (err) {
        console.error("Failed to fetch expense", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [expenseId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await axios.post(
        `${API_URL}/expenses/${expenseId}/comments`,
        { message: comment },
        { withCredentials: true }
      );
      setComments((prev) => [...prev, res.data.data]);
      setComment("");
    } catch (err) {
      console.log(err);
      
      alert("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0f0c] flex items-center justify-center">
        <p className="text-[#c8f135] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Loading expense...
        </p>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-[#0e0f0c] flex items-center justify-center">
        <p className="text-red-400 text-sm">Expense not found.</p>
      </div>
    );
  }

  const split = splitColors[expense.options] ?? {
    bg: "bg-white/5", text: "text-[#8a8d70]", border: "border-white/10", label: expense.options
  };
  const totalCents = expense.paidBy?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalDollars = (totalCents / 100).toFixed(2);
  const formattedDate = new Date(expense.createdAt).toLocaleDateString("en-US", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp 0.4s 0.05s both; }
        .fade-2 { animation: fadeUp 0.4s 0.12s both; }
        .fade-3 { animation: fadeUp 0.4s 0.19s both; }
        .fade-4 { animation: fadeUp 0.4s 0.26s both; }
      `}</style>

      <div className="min-h-screen bg-[#0e0f0c] px-4 py-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(200,241,53,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6">

          {/* Back */}
          <div className="fade-1">
            <Link
              to={`/groups/${groupId}`}
              className="inline-flex items-center gap-1.5 text-[#5a5d48] text-xs hover:text-[#c8f135] transition-colors no-underline"
            >
              ← Back to group
            </Link>
          </div>

          {/* Header */}
          <div className="fade-1 bg-[#161810] border border-white/[0.07] rounded-3xl p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-[#c8f135] mb-1">
                  Expense
                </p>
                <h1
                  className="text-[#f0f2e8] text-2xl font-extrabold leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.04em" }}
                >
                  {expense.name}
                </h1>
                <p className="text-[#4a4d3a] text-xs mt-1">{formattedDate}</p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-[#f0f2e8] text-3xl font-extrabold"
                  style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.04em" }}
                >
                  ${(totalDollars * 100).toFixed(2)}
                </p>
                <span
                  className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[0.62rem] font-semibold border ${split.bg} ${split.text} ${split.border}`}
                  style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
                >
                  {split.label}
                </span>
              </div>
            </div>
          </div>

          {/* Paid by */}
          <div className="fade-2 bg-[#161810] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[#8a8d70] text-[0.7rem] uppercase tracking-widest font-semibold mb-3">Paid by</p>
            <div className="flex flex-col gap-2">
              {expense.paidBy?.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[0.6rem] font-bold text-[#c8f135]"
                      style={{ background: "rgba(200,241,53,0.1)", fontFamily: "'Syne', sans-serif" }}
                    >
                      {(p.user?.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[#f0f2e8] text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {p.user?.name || "Unknown"}
                    </span>
                  </div>
                  <span className="text-[#c8f135] text-sm font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                    ${(p.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Split breakdown */}
          <div className="fade-3 bg-[#161810] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[#8a8d70] text-[0.7rem] uppercase tracking-widest font-semibold mb-3">Split breakdown</p>
            <div className="flex flex-col gap-2">
              {expense.members?.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[0.6rem] font-bold text-[#8a8d70]"
                      style={{ background: "rgba(255,255,255,0.05)", fontFamily: "'Syne', sans-serif" }}
                    >
                      {(m.user?.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[#f0f2e8] text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {m.user?.name || "Unknown"}
                    </span>
                  </div>
                  <span className="text-[#8a8d70] text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                    owes ${(m.amountOwed / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="fade-4 bg-[#161810] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[#8a8d70] text-[0.7rem] uppercase tracking-widest font-semibold mb-3">Comments</p>

            {comments.length === 0 ? (
              <p className="text-[#3d4030] text-xs text-center py-4">
                No comments yet. Be the first!
              </p>
            ) : (
              <div className="flex flex-col gap-3 mb-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-[#c8f135] shrink-0"
                      style={{ background: "rgba(200,241,53,0.1)", fontFamily: "'Syne', sans-serif" }}
                    >
                      {(c.sender?.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[#f0f2e8] text-xs font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {c.sender?.name || "User"}
                      </p>
                      <p className="text-[#8a8d70] text-xs mt-0.5">{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment(e)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#0e0f0c] border border-white/10 rounded-xl px-4 py-2.5 text-[#f0f2e8] text-xs outline-none focus:border-[#c8f135] transition-colors placeholder:text-[#3d4030]"
              />
              <button
                onClick={handlePostComment}
                disabled={posting || !comment.trim()}
                className="bg-[#c8f135] text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:bg-[#a8d020] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {posting ? "..." : "Post"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ExpenseDetail;