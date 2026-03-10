import { Button } from "@/components/ui/button";
import { UserGroups } from "@/services/groupService";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ─── FRIENDS HELPERS ──────────────────────────────────────────────────────────
// FRIENDS LOGIC: Replace getFriendName() with real logic to extract the other
// person's name from the group. A FRIEND group has 2 members — you and them.
// e.g. g.groupId.members.find(m => m._id !== currentUser._id)?.name
const getFriendName = (g) => g.groupId.name ?? "Unknown";

const getInitials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// ─── ROLE BADGE COLOURS ───────────────────────────────────────────────────────
const roleMeta = {
  ADMIN:  { bg: "bg-[#c8f135]/10", text: "text-[#c8f135]", border: "border-[#c8f135]/20" },
  MEMBER: { bg: "bg-white/[0.05]", text: "text-[#8a8d70]", border: "border-white/10" },
};

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────────────
const SectionHeader = ({ title, count, action }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-[#f0f2e8] text-base font-bold"
      style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
      {title}
    </h2>
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.06] text-[#6b7055] text-[0.65rem] font-semibold">
      {count}
    </span>
    <div className="flex-1 h-px bg-white/[0.05]" />
    {action}
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-10 bg-[#161810] border border-dashed border-white/[0.07] rounded-2xl text-center">
    <span className="text-3xl mb-3">{icon}</span>
    <p className="text-[#3d4030] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {message}
    </p>
  </div>
);

const SkeletonCards = ({ n = 3 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-4">
        <div className="skeleton-bar w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton-bar h-3.5 w-2/3 rounded" />
          <div className="skeleton-bar h-2.5 w-1/3 rounded" />
        </div>
        <div className="skeleton-bar h-6 w-20 rounded-full flex-shrink-0" />
      </div>
    ))}
  </div>
);

// ─── FRIEND CARD ──────────────────────────────────────────────────────────────
const FriendCard = ({ g }) => {
  // FRIENDS LOGIC: swap getFriendName() with real name resolution
  const name = getFriendName(g);

  return (
    <div className="flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-4 transition-all duration-200 hover:border-white/[0.13] hover:bg-[#1a1c14]">
      {/* Avatar — round for friends, square for groups */}
      <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-[#c8f135] border border-[#c8f135]/20"
        style={{ background: "rgba(200,241,53,0.07)", fontFamily: "'Syne', sans-serif" }}>
        {getInitials(name)}
      </div>

      <div className="flex-1 min-w-0">
        {/* FRIENDS LOGIC: replace with real friend name */}
        <p className="text-[#f0f2e8] text-sm font-semibold truncate"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>
          {name}
        </p>
        {/* FRIENDS LOGIC: replace with real balance string e.g. "Owes you $12.00" */}
        <p className="text-[#4a4d3a] text-xs mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Balance: <span className="text-[#6b7055]">—</span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link to={`/groups/${g.groupId._id}`}>
          <button className="text-[0.72rem] font-semibold text-[#8a8d70] border border-white/10 px-3 py-1.5 rounded-full transition-all hover:text-[#f0f2e8] hover:border-white/25"
            style={{ fontFamily: "'Outfit', sans-serif" }}>
            View
          </button>
        </Link>
        {/* FRIENDS LOGIC: wire up settle payment action */}
        <button className="text-[0.72rem] font-bold text-[#0e0f0c] bg-[#c8f135] px-3 py-1.5 rounded-full transition-all hover:bg-[#a8d020] hover:shadow-[0_4px_16px_rgba(200,241,53,0.25)] hover:-translate-y-px"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          Settle
        </button>
      </div>
    </div>
  );
};

// ─── GROUP CARD (joined) ───────────────────────────────────────────────────────
const GroupCard = ({ g }) => {
  const role = g.role || "MEMBER";
  const colors = roleMeta[role] || roleMeta.MEMBER;

  return (
    <div className="flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-4 transition-all duration-200 hover:border-white/[0.13] hover:bg-[#1a1c14]">
      {/* Avatar — square for groups */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-[#c8f135] border border-[#c8f135]/20"
        style={{ background: "rgba(200,241,53,0.07)", fontFamily: "'Syne', sans-serif" }}>
        {getInitials(g.groupId.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[#f0f2e8] text-sm font-semibold truncate"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>
          {g.groupId.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {role}
          </span>
          {/* GROUPS LOGIC: replace "—" with real amount owed */}
          <span className="text-[#4a4d3a] text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
            · Owed: <span className="text-[#6b7055]">—</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* GROUPS LOGIC: wire up settle action */}
        <button className="text-[0.72rem] font-semibold text-[#8a8d70] border border-white/10 px-3 py-1.5 rounded-full transition-all hover:text-[#f0f2e8] hover:border-white/25"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          Settle
        </button>
        <Link to={`/groups/${g.groupId._id}`}>
          <button className="text-[0.72rem] font-bold text-[#0e0f0c] bg-[#c8f135] px-3 py-1.5 rounded-full transition-all hover:bg-[#a8d020] hover:shadow-[0_4px_16px_rgba(200,241,53,0.25)] hover:-translate-y-px"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Open →
          </button>
        </Link>
      </div>
    </div>
  );
};

// ─── INVITE CARD ──────────────────────────────────────────────────────────────
const InviteCard = ({ g }) => (
  <div className="flex items-center gap-4 bg-[#161810] border border-white/[0.07] rounded-2xl px-5 py-4 transition-all duration-200 hover:border-white/[0.13]">
    <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-[#8a8d70] border border-white/10"
      style={{ background: "rgba(255,255,255,0.04)", fontFamily: "'Syne', sans-serif" }}>
      {getInitials(g.groupId.name)}
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-[#f0f2e8] text-sm font-semibold truncate"
        style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>
        {g.groupId.name}
      </p>
      <p className="text-[#4a4d3a] text-xs mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
        You've been invited to join
      </p>
    </div>

    <div className="flex items-center gap-2 flex-shrink-0">
      {/* GROUPS LOGIC: wire up reject invitation */}
      <button className="text-[0.72rem] font-semibold text-[#8a8d70] border border-white/10 px-3 py-1.5 rounded-full transition-all hover:text-red-400 hover:border-red-400/30"
        style={{ fontFamily: "'Outfit', sans-serif" }}>
        Reject
      </button>
      {/* GROUPS LOGIC: wire up accept/join invitation */}
      <button className="text-[0.72rem] font-bold text-[#0e0f0c] bg-[#c8f135] px-3 py-1.5 rounded-full transition-all hover:bg-[#a8d020] hover:shadow-[0_4px_16px_rgba(200,241,53,0.25)] hover:-translate-y-px"
        style={{ fontFamily: "'Syne', sans-serif" }}>
        Join
      </button>
    </div>
  </div>
);

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const Groups = () => {
  const [group, setGroup] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await UserGroups();
        setGroup(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // FRIENDS LOGIC: filter friend-type groups
  const friendGroups  = group.filter((g) => g.status=== "JOINED" && g.groupId.type === "FRIEND");
  const invitedGroups = group.filter((g) => g.status === "INVITED" && g.groupId.type === "GROUP");
  const joinedGroups  = group.filter((g) => g.status === "JOINED"  && g.groupId.type === "GROUP");
console.log("friends: ", friendGroups);

  console.log("invited groups ", invitedGroups, "joined", joinedGroups);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500&display=swap');

        @keyframes grpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .grp-fade-1 { animation: grpFadeUp 0.5s 0.05s both; }
        .grp-fade-2 { animation: grpFadeUp 0.5s 0.13s both; }
        .grp-fade-3 { animation: grpFadeUp 0.5s 0.21s both; }
        .grp-fade-4 { animation: grpFadeUp 0.5s 0.29s both; }

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

      <div className="min-h-screen bg-[#0e0f0c] px-4 py-10" style={{ fontFamily: "'Outfit', sans-serif" }}>

        {/* Dot grid bg */}
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(200,241,53,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-10">

          {/* Page header */}
          <div className="grp-fade-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-[#c8f135] mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              Your workspace
            </p>
            <h1 className="text-[#f0f2e8] text-3xl font-extrabold leading-tight"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.04em" }}>
              Groups & Friends
            </h1>
            <p className="text-[#4a4d3a] text-sm mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Manage shared expenses with your people.
            </p>
          </div>

          {loading ? (
            <SkeletonCards n={4} />
          ) : (
            <>
              {/* ── FRIENDS ───────────────────────────────────────────────── */}
              <div className="grp-fade-2">
                <SectionHeader
                  title="Friends"
                  count={friendGroups.length}
                  action={
                    // FRIENDS LOGIC: wire up Add Friend modal / action
                    <button
                      className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-[#0e0f0c] bg-[#c8f135] px-3.5 py-1.5 rounded-full transition-all hover:bg-[#a8d020] hover:shadow-[0_4px_16px_rgba(200,241,53,0.25)] hover:-translate-y-px"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      + Add Friend
                    </button>
                  }
                />
                {friendGroups.length === 0 ? (
                  <EmptyState icon="🤝" message="No friends yet. Add someone to start splitting!" />
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {/* FRIENDS LOGIC: FriendCard uses getFriendName() — replace with real resolver */}
                    {friendGroups.map((g) => (
                      <FriendCard key={g.groupId._id} g={g} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── JOINED GROUPS ─────────────────────────────────────────── */}
              <div className="grp-fade-3">
                <SectionHeader title="Joined Groups" count={joinedGroups.length} />
                {joinedGroups.length === 0 ? (
                  <EmptyState icon="🏠" message="You haven't joined any groups yet." />
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {joinedGroups.map((g) => (
                      <GroupCard key={g.groupId._id} g={g} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── INVITATIONS ───────────────────────────────────────────── */}
              <div className="grp-fade-4">
                <SectionHeader title="Invitations" count={invitedGroups.length} />
                {invitedGroups.length === 0 ? (
                  <EmptyState icon="✉️" message="No pending invitations right now." />
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {invitedGroups.map((g) => (
                      <InviteCard key={g.groupId._id} g={g} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Groups;