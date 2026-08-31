import { useEffect, useMemo, useRef, useState } from "react";
import { useTeamMembers } from "../hooks/useTeamMembers";

const roleTone = {
  core: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
  mentor: "bg-rose-500/15 text-rose-200 border-rose-500/25",
  faculty: "bg-sky-500/15 text-sky-200 border-sky-500/25",
  founder: "bg-amber-500/15 text-amber-200 border-amber-500/25",
};

const MemberCard = ({ member }) => (
  <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
    <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
          {member.imageUrl ? (
            <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/15 to-white/5 text-3xl font-semibold text-white">
              {member.name?.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-lg font-semibold text-white">{member.name}</p>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${roleTone[member.category] || "border-white/10 bg-white/10 text-white/80"}`}>
              {member.category}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/70">{member.role}</p>
          {member.subtitle && <p className="mt-1 text-sm text-white/50">{member.subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {member.teamYear && (
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
            Team {member.teamYear}
          </span>
        )}
        {member.batch && (
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
            Batch {member.batch}
          </span>
        )}
        {member.domain?.map((d) => (
          <span key={d} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">{d}</span>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-1 text-xs">
        {member.github && (
          <a href={member.github} target="_blank" rel="noreferrer" className="text-white/55 transition-colors hover:text-white">
            GitHub
          </a>
        )}
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-white/55 transition-colors hover:text-white">
            LinkedIn
          </a>
        )}
      </div>
    </div>
  </div>
);

const YearSection = ({ year, members, expanded, onToggle }) => (
  <section className="mb-5">
    <div
      className={`group w-full rounded-[2rem] border p-5 text-left shadow-[0_20px_80px_rgba(0,0,0,0.18)] transition-all duration-300 ${
        expanded
          ? "border-white/20 bg-white/[0.08]"
          : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Team Year</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{year}</h2>
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">{members.length} members</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {members.slice(0, 3).map((member) => (
            <span key={member._id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              {member.name}
            </span>
          ))}
          {members.length > 3 && (
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/55">
              + {members.length - 3} more members
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-white/55">
            {expanded ? "Hide member cards" : "Open the full list for this year"}
          </p>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60">
            {expanded ? "Collapse" : "View members"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <MemberCard key={member._id} member={member} />
            ))}
          </div>
        </div>
      )}
    </div>
  </section>
);

const Team = () => {
  const { members, loading } = useTeamMembers();
  const [expandedYear, setExpandedYear] = useState(null);
  const hasInitializedExpandedYear = useRef(false);

  const yearlyGroups = useMemo(() => {
    const nonStaticMembers = members.filter((member) => !["founder", "faculty"].includes(member.category));
    const groups = {};

    nonStaticMembers.forEach((member) => {
      const year = member.teamYear || member.batch || "Unassigned";
      if (!groups[year]) groups[year] = [];
      groups[year].push(member);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => String(b).localeCompare(String(a), undefined, { numeric: true }))
      .map(([year, items]) => ({
        year,
        members: items.sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(a.createdAt) - new Date(b.createdAt)),
      }));
  }, [members]);

  useEffect(() => {
    if (hasInitializedExpandedYear.current) return;
    if (yearlyGroups.length > 0) {
      hasInitializedExpandedYear.current = true;
      setExpandedYear(String(yearlyGroups[0].year));
    }
  }, [yearlyGroups]);

  const totalMembers = members.filter((member) => !["founder", "faculty"].includes(member.category)).length;
  const founders = members.filter((member) => member.category?.toLowerCase() === "founder").length;
  const faculty = members.filter((member) => member.category?.toLowerCase() === "faculty").length;

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-20">
      <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-12 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">The People</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Our team, organized by year.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Founders and faculty stay fixed in About. This page shows the evolving annual teams, grouped by the year they belong to.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-white/50">Loading...</p>
      ) : yearlyGroups.length > 0 ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Team members</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalMembers}+</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Year groups</p>
              <p className="mt-3 text-3xl font-semibold text-white">{yearlyGroups.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Founders</p>
              <p className="mt-3 text-3xl font-semibold text-white">{founders}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Faculty</p>
              <p className="mt-3 text-3xl font-semibold text-white">{faculty}</p>
            </div>
          </div>

          <div className="space-y-4">
            {yearlyGroups.map((group) => (
              <YearSection
                key={String(group.year)}
                year={group.year}
                members={group.members}
                expanded={expandedYear === String(group.year)}
                onToggle={() =>
                  setExpandedYear((current) => (current === String(group.year) ? null : String(group.year)))
                }
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          Team info coming soon.
        </div>
      )}
    </div>
  );
};

export default Team;
