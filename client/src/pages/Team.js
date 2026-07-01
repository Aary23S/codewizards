import { useEffect, useMemo, useState } from "react";
import { getTeam } from "../services/api";

const SECTION_ORDER = [
  { key: "founder", label: "Founders", description: "The people who started the club.", accent: "from-amber-500/20 to-transparent" },
  { key: "faculty", label: "Faculty Coordinators", description: "Faculty guidance and institutional support.", accent: "from-sky-500/20 to-transparent" },
  { key: "core", label: "Core Team", description: "The active student group running day-to-day work.", accent: "from-emerald-500/20 to-transparent" },
  { key: "mentor", label: "Mentors", description: "Senior support for growth, reviews, and direction.", accent: "from-rose-500/20 to-transparent" },
];

const roleTone = {
  founder: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  faculty: "bg-sky-500/15 text-sky-200 border-sky-500/25",
  core: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25",
  mentor: "bg-rose-500/15 text-rose-200 border-rose-500/25",
};

const MemberCard = ({ member }) => (
  <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
    <div className={`absolute inset-0 bg-gradient-to-br ${SECTION_ORDER.find((item) => item.key === member.category)?.accent || "from-white/10 to-transparent"} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

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
        {member.batch && (
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
            Batch {member.batch}
          </span>
        )}
        {member.domain?.map((d) => (
          <span key={d} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
            {d}
          </span>
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

const TeamSection = ({ title, description, members }) => (
  <section className="mb-14">
    <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">{title}</p>
        {description && <p className="mt-2 max-w-2xl text-sm text-white/55">{description}</p>}
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">{members.length} members</p>
    </div>

    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => (
        <MemberCard key={member._id} member={member} />
      ))}
    </div>
  </section>
);

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeam()
      .then((res) => setMembers(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(
    () =>
      SECTION_ORDER.map((section) => ({
        ...section,
        members: members.filter((member) => member.category === section.key),
      })).filter((section) => section.members.length > 0),
    [members]
  );

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-20">
      <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-14 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">The People</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          A team page that feels like the rest of the brand.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Team profiles are now admin-managed, support images, and can carry one extra descriptive field for department, batch note, or other context.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : (
        grouped.map((section) => (
          <TeamSection
            key={section.key}
            title={section.label}
            description={section.description}
            members={section.members}
          />
        ))
      )}

      {!loading && members.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          Team info coming soon.
        </div>
      )}
    </div>
  );
};

export default Team;
