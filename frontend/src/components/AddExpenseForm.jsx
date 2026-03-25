import React, { useState, useMemo } from "react";
import { PostExpense } from "@/services/expenseService";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;
const toCents = (val) => Math.round(parseFloat(val || 0) * 100);
const toDisplay = (cents) => (cents / 100).toFixed(2);

/** Given paidBy[], members[], splitOption → returns members with amountOwed (in cents) */
const previewSplit = (paidByCents, selectedMembers, splitOption, memberData) => {
  const total = paidByCents.reduce((s, p) => s + p.amount, 0);
  if (total <= 0 || selectedMembers.length === 0) return [];

  switch (splitOption) {
    case "EQUALLY": {
      const base = Math.floor(total / selectedMembers.length);
      let rem = total % selectedMembers.length;
      return selectedMembers.map((id) => {
        const extra = rem-- > 0 ? 1 : 0;
        return { id, amountOwed: base + extra };
      });
    }
    case "UNEQUALLY": {
      return selectedMembers.map((id) => ({
        id,
        amountOwed: toCents(memberData[id]?.unequalAmount || 0),
      }));
    }
    case "PERCENTAGE": {
      return selectedMembers.map((id) => {
        const pct = parseFloat(memberData[id]?.weight || 0);
        return { id, amountOwed: Math.floor((total * pct) / 100) };
      });
    }
    case "SHARES": {
      const totalShares = selectedMembers.reduce(
        (s, id) => s + parseFloat(memberData[id]?.weight || 0),
        0
      );
      if (totalShares <= 0) return selectedMembers.map((id) => ({ id, amountOwed: 0 }));
      return selectedMembers.map((id) => {
        const w = parseFloat(memberData[id]?.weight || 0);
        return { id, amountOwed: Math.floor((total * w) / totalShares) };
      });
    }
    case "ADJUSTMENT": {
      const totalAdj = selectedMembers.reduce(
        (s, id) => s + toCents(memberData[id]?.weight || 0),
        0
      );
      const base = Math.floor((total - totalAdj) / selectedMembers.length);
      let rem = (total - totalAdj) % selectedMembers.length;
      return selectedMembers.map((id) => {
        const adj = toCents(memberData[id]?.weight || 0);
        const extra = rem-- > 0 ? 1 : 0;
        return { id, amountOwed: base + adj + extra };
      });
    }
    default:
      return [];
  }
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const Label = ({ children }) => (
  <p
    className="text-[#5a5d48] text-[0.68rem] uppercase tracking-[0.14em] font-semibold mb-2"
    style={{ fontFamily: "'Outfit', sans-serif" }}
  >
    {children}
  </p>
);

const inputCls =
  "w-full bg-[#0a0b09] border border-white/[0.08] rounded-xl px-4 py-3 text-[#f0f2e8] text-sm outline-none focus:border-[#c8f135]/60 transition-colors placeholder:text-[#2e3028]";

const splitOptions = [
  { value: "EQUALLY",    label: "Equally",    desc: "Everyone pays the same" },
  { value: "UNEQUALLY",  label: "Unequally",  desc: "Set exact amounts per person" },
  { value: "PERCENTAGE", label: "Percentage", desc: "Split by % weights" },
  { value: "SHARES",     label: "Shares",     desc: "Split by share count" },
  { value: "ADJUSTMENT", label: "Adjustment", desc: "Equal base + fixed adjustments" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const AddExpenseForm = ({ groupId, members, onComplete }) => {
  // members = [{ memberId, role, ... }] — populated from GroupMember
  // Each member may have member.memberId as string or object with _id + name

  const resolvedMembers = useMemo(() =>
    members.map((m) => ({
      id: typeof m.memberId === "object" ? m.memberId._id : m.memberId,
      name:
        typeof m.memberId === "object"
          ? m.memberId.name || "Unknown"
          : m.name || `Member`,
    })),
    [members]
  );

  // ── Core state ──────────────────────────────────────────────────────────────
  const [name, setName]             = useState("");
  const [splitOption, setSplitOption] = useState("EQUALLY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // ── Payers: [{ memberId, amount (string dollars) }] ─────────────────────────
  const [payers, setPayers] = useState([{ memberId: resolvedMembers[0]?.id || "", amount: "" }]);

  // ── Selected members for split ───────────────────────────────────────────────
  const [selectedMembers, setSelectedMembers] = useState(
    resolvedMembers.map((m) => m.id)
  );

  // ── Per-member weight/amount data keyed by memberId string ───────────────────
  // unequalAmount: dollar string | weight: number string
  const [memberData, setMemberData] = useState({});

  // ── Derived total ────────────────────────────────────────────────────────────
  const totalCents = useMemo(
    () => payers.reduce((s, p) => s + toCents(p.amount), 0),
    [payers]
  );

  // ── Live preview ─────────────────────────────────────────────────────────────
  const preview = useMemo(
    () => previewSplit(
      payers.map((p) => ({ user: p.memberId, amount: toCents(p.amount) })),
      selectedMembers,
      splitOption,
      memberData
    ),
    [payers, selectedMembers, splitOption, memberData]
  );

  // ── Validation helpers ────────────────────────────────────────────────────────
  const unequal_total = useMemo(
    () => selectedMembers.reduce((s, id) => s + toCents(memberData[id]?.unequalAmount || 0), 0),
    [selectedMembers, memberData]
  );
  const pct_total = useMemo(
    () => selectedMembers.reduce((s, id) => s + parseFloat(memberData[id]?.weight || 0), 0),
    [selectedMembers, memberData]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateMemberData = (id, key, val) => {
    setMemberData((prev) => ({ ...prev, [id]: { ...prev[id], [key]: val } }));
  };

  const addPayer = () => {
    const unused = resolvedMembers.find((m) => !payers.find((p) => p.memberId === m.id));
    if (unused) setPayers((prev) => [...prev, { memberId: unused.id, amount: "" }]);
  };

  const removePayer = (i) => {
    if (payers.length === 1) return;
    setPayers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updatePayer = (i, key, val) => {
    setPayers((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: val } : p)));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Expense name is required.");
    if (totalCents <= 0) return setError("Total amount must be greater than 0.");
    if (selectedMembers.length === 0) return setError("Select at least one member.");
    if (payers.some((p) => !p.memberId || toCents(p.amount) <= 0))
      return setError("Each payer must have a member and amount.");

    if (splitOption === "UNEQUALLY" && unequal_total !== totalCents)
      return setError(`Unequal amounts must sum to total (${fmt(totalCents)}). Currently: ${fmt(unequal_total)}.`);
    if (splitOption === "PERCENTAGE" && Math.round(pct_total) !== 100)
      return setError(`Percentages must sum to 100%. Currently: ${pct_total.toFixed(1)}%.`);

    // Build payload — validator accepts dollar floats and converts to cents
    const paidBy = payers.map((p) => ({
      user: p.memberId,
      amount: parseFloat(p.amount),
    }));

    const membersPayload = selectedMembers.map((id) => {
      let amountOwed = 0;
      let weight = 0;

      switch (splitOption) {
        case "EQUALLY":
          amountOwed = 0; // backend recalculates
          weight = 0;
          break;
        case "UNEQUALLY":
          amountOwed = parseFloat(memberData[id]?.unequalAmount || 0);
          weight = 0;
          break;
        case "PERCENTAGE":
        case "SHARES":
          amountOwed = 0;
          weight = parseFloat(memberData[id]?.weight || 0);
          break;
        case "ADJUSTMENT":
          amountOwed = 0;
          weight = parseFloat(memberData[id]?.weight || 0);
          break;
        default:
          break;
      }

      return { user: id, amountOwed, weight };
    });

    try {
      setSubmitting(true);
      await PostExpense({
        name: name.trim(),
        groupId,
        paidBy,
        members: membersPayload,
        options: splitOption,
      });
      onComplete();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .split-pill {
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 999px;
          padding: 0.35rem 0.9rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #5a5d48;
          background: transparent;
          transition: all 0.15s;
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .split-pill:hover { color: #c8f135; border-color: rgba(200,241,53,0.25); }
        .split-pill.active {
          background: rgba(200,241,53,0.1);
          border-color: rgba(200,241,53,0.35);
          color: #c8f135;
        }

        .member-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.15s;
          background: transparent;
        }
        .member-chip:hover { border-color: rgba(200,241,53,0.25); }
        .member-chip.selected {
          background: rgba(200,241,53,0.07);
          border-color: rgba(200,241,53,0.3);
        }
        .member-chip .avatar {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: rgba(200,241,53,0.08);
          border: 1px solid rgba(200,241,53,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 700; color: #c8f135;
          font-family: 'Syne', sans-serif;
          flex-shrink: 0;
        }
        .member-chip.selected .avatar {
          background: rgba(200,241,53,0.18);
          border-color: rgba(200,241,53,0.4);
        }
        .member-chip .chip-name {
          font-size: 0.78rem;
          font-weight: 500;
          color: #5a5d48;
          font-family: 'Outfit', sans-serif;
          transition: color 0.15s;
        }
        .member-chip.selected .chip-name { color: #f0f2e8; }
        .member-chip .check {
          width: 14px; height: 14px;
          border-radius: 4px;
          border: 1.5px solid rgba(255,255,255,0.1);
          margin-left: auto;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .member-chip.selected .check {
          background: #c8f135;
          border-color: #c8f135;
          display: flex; align-items: center; justify-content: center;
        }

        .preview-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .preview-row:last-child { border-bottom: none; }

        .weight-input {
          width: 80px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 5px 10px;
          color: #f0f2e8;
          font-size: 0.8rem;
          outline: none;
          text-align: right;
          font-family: 'Outfit', sans-serif;
          transition: border-color 0.15s;
        }
        .weight-input:focus { border-color: rgba(200,241,53,0.5); }

        .section-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 16px;
        }

        .err-badge {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 10px 14px;
          color: #f87171;
          font-size: 0.78rem;
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >

        {/* ── NAME ── */}
        <div>
          <Label>Expense name</Label>
          <input
            type="text"
            placeholder="e.g. Dinner at Rosa's"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            required
          />
        </div>

        {/* ── PAYERS ── */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-3">
            <Label>Paid by</Label>
            {payers.length < resolvedMembers.length && (
              <button
                type="button"
                onClick={addPayer}
                className="text-[0.7rem] font-semibold text-[#c8f135]/70 hover:text-[#c8f135] transition-colors"
              >
                + Add payer
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {payers.map((payer, i) => (
              <div key={i} className="flex items-center gap-2">
                {/* Member select */}
                <select
                  value={payer.memberId}
                  onChange={(e) => updatePayer(i, "memberId", e.target.value)}
                  className="flex-1 bg-[#0a0b09] border border-white/8 rounded-xl px-3 py-2.5 text-[#f0f2e8] text-sm outline-none focus:border-[#c8f135]/60 transition-colors"
                >
                  {resolvedMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                {/* Amount */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4030] text-sm">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={payer.amount}
                    onChange={(e) => updatePayer(i, "amount", e.target.value)}
                    className="w-28 bg-[#0a0b09] border border-white/8 rounded-xl pl-7 pr-3 py-2.5 text-[#f0f2e8] text-sm outline-none focus:border-[#c8f135]/60 transition-colors"
                  />
                </div>

                {/* Remove */}
                {payers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePayer(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3d4030] hover:text-red-400 hover:bg-red-400/10 transition-all text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          {totalCents > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="text-[#3d4030] text-xs">Total</span>
              <span className="text-[#c8f135] text-sm font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                {fmt(totalCents)}
              </span>
            </div>
          )}
        </div>

        {/* ── SPLIT TYPE ── */}
        <div>
          <Label>Split method</Label>
          <div className="flex flex-wrap gap-2">
            {splitOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSplitOption(opt.value)}
                className={`split-pill ${splitOption === opt.value ? "active" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[#3d4030] text-[0.7rem] mt-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {splitOptions.find((o) => o.value === splitOption)?.desc}
          </p>
        </div>

        {/* ── MEMBER SELECTION + WEIGHTS ── */}
        <div className="section-card">
          <Label>Split between</Label>

          <div className="flex flex-col gap-2">
            {resolvedMembers.map((m) => {
              const isSelected = selectedMembers.includes(m.id);
              const initials = m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const data = memberData[m.id] || {};
              const previewEntry = preview.find((p) => p.id === m.id);

              return (
                <div key={m.id}>
                  {/* Chip row */}
                  <div
                    className={`member-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleMember(m.id)}
                  >
                    <div className="avatar">{initials}</div>
                    <span className="chip-name">{m.name}</span>

                    {/* Inline weight input for weighted splits */}
                    {isSelected && ["PERCENTAGE", "SHARES", "ADJUSTMENT"].includes(splitOption) && (
                      <div
                        className="flex items-center gap-1.5 ml-auto mr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          min="0"
                          step={splitOption === "PERCENTAGE" ? "0.1" : "0.01"}
                          placeholder="0"
                          value={data.weight || ""}
                          onChange={(e) => updateMemberData(m.id, "weight", e.target.value)}
                          className="weight-input"
                        />
                        <span className="text-[#3d4030] text-[0.68rem]">
                          {splitOption === "PERCENTAGE" ? "%" : splitOption === "SHARES" ? "sh" : "$adj"}
                        </span>
                      </div>
                    )}

                    {/* Unequal amount input */}
                    {isSelected && splitOption === "UNEQUALLY" && (
                      <div
                        className="flex items-center gap-1 ml-auto mr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[#3d4030] text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={data.unequalAmount || ""}
                          onChange={(e) => updateMemberData(m.id, "unequalAmount", e.target.value)}
                          className="weight-input"
                        />
                      </div>
                    )}

                    {/* Preview amount (non-input splits) */}
                    {isSelected && splitOption === "EQUALLY" && previewEntry && totalCents > 0 && (
                      <span
                        className="ml-auto mr-2 text-[#6b7055] text-xs font-semibold"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {fmt(previewEntry.amountOwed)}
                      </span>
                    )}

                    <div className="check">
                      {isSelected && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="#0e0f0c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unequal running total */}
          {splitOption === "UNEQUALLY" && selectedMembers.length > 0 && totalCents > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[#3d4030] text-xs">Assigned</span>
                <span
                  className={`text-xs font-bold ${unequal_total === totalCents ? "text-[#c8f135]" : unequal_total > totalCents ? "text-red-400" : "text-[#6b7055]"}`}
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {fmt(unequal_total)} / {fmt(totalCents)}
                </span>
              </div>
              {unequal_total > totalCents && (
                <p className="text-red-400/70 text-[0.68rem] mt-1">Exceeds total by {fmt(unequal_total - totalCents)}</p>
              )}
              {unequal_total < totalCents && unequal_total > 0 && (
                <p className="text-[#5a5d48] text-[0.68rem] mt-1">{fmt(totalCents - unequal_total)} left to assign</p>
              )}
            </div>
          )}

          {/* Percentage running total */}
          {splitOption === "PERCENTAGE" && selectedMembers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[#3d4030] text-xs">Total %</span>
                <span
                  className={`text-xs font-bold ${Math.round(pct_total) === 100 ? "text-[#c8f135]" : pct_total > 100 ? "text-red-400" : "text-[#6b7055]"}`}
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {pct_total.toFixed(1)}% / 100%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── LIVE PREVIEW ── */}
        {totalCents > 0 && selectedMembers.length > 0 && splitOption !== "EQUALLY" && (
          <div className="section-card">
            <Label>Preview</Label>
            <div>
              {preview.map((p) => {
                const m = resolvedMembers.find((r) => r.id === p.id);
                return (
                  <div key={p.id} className="preview-row">
                    <span className="text-[#8a8d70] text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {m?.name || "Unknown"}
                    </span>
                    <span
                      className="text-[#f0f2e8] text-xs font-semibold"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {fmt(p.amountOwed)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && <div className="err-badge">{error}</div>}

        {/* ── SUBMIT ── */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#c8f135] text-[#0e0f0c] font-bold py-3.5 rounded-2xl transition-all hover:bg-[#a8d020] hover:shadow-[0_8px_24px_rgba(200,241,53,0.2)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}
        >
          {submitting ? "Saving…" : "Save Expense"}
        </button>
      </form>
    </>
  );
};

export default AddExpenseForm;