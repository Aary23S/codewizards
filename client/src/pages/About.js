import { useEffect, useMemo, useState } from "react";
import { getTeam } from "../services/api";

const fallbackFounders = [
  {
    name: "Aary Satardekar",
    role: "Co-Founder",
    subtitle: "Founding Team",
    batch: 2022,
    category: "founder",
  },
  {
    name: "Aarya Dalal",
    role: "Co-Founder",
    subtitle: "Founding Team",
    batch: 2022,
    category: "founder",
  },
];

const fallbackFaculty = [
  {
    name: "Mr. Somnath Salunkhe",
    role: "Faculty Coordinator",
    subtitle: "Computer Science & Engineering",
    category: "faculty",
  },
  {
    name: "Dr. Vidya Baddadare",
    role: "Faculty Coordinator",
    subtitle: "Computer Science & Engineering",
    category: "faculty",
  },
];

const roleTone = {
  founder: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  faculty: "bg-sky-500/15 text-sky-200 border-sky-500/25",
};

const MemberCard = ({ member }) => (
  <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
    <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex flex-col gap-4">
      <div className="h-24 w-24 overflow-hidden rounded-3xl border border-white/10 bg-slate-800">
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
        <div className="mt-3 flex flex-wrap gap-2">
          {member.batch && <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">Batch {member.batch}</span>}
          {member.domain?.map((d) => (
            <span key={d} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">{d}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Section = ({ title, members, compact = false }) => (
  <section className="mb-10">
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-xs uppercase tracking-[0.28em] text-white/45">{title}</h2>
      <p className="text-xs uppercase tracking-[0.2em] text-white/30">{members.length} members</p>
    </div>
    <div className={compact ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "grid grid-cols-1 gap-5 md:grid-cols-2"}>
      {members.map((member) => <MemberCard key={`${member.category}-${member.name}`} member={member} />)}
    </div>
  </section>
);

const About = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeam()
      .then((res) => setMembers(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const founders = useMemo(() => {
    const apiFounders = members.filter((member) => member.category === "founder");
    return apiFounders.length > 0 ? apiFounders : fallbackFounders;
  }, [members]);

  const faculty = useMemo(() => {
    const apiFaculty = members.filter((member) => member.category === "faculty");
    return apiFaculty.length > 0 ? apiFaculty : fallbackFaculty;
  }, [members]);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-20">
      <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-16 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Who We Are</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">About CodeWizards</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          We are building a student-led technical community with shared visibility, clear ownership, and admin-managed team profiles that can evolve with the club.
        </p>
      </div>

      <div className="mb-14 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Mission</p>
          <p className="mt-4 text-sm leading-7 text-white/65">
            To build a strong technical community where every student, regardless of background, gets access to guidance, projects, and opportunities through peer mentorship and collaboration.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Vision</p>
          <p className="mt-4 text-sm leading-7 text-white/65">
            To make CodeWizards the most impactful student-led technical club in Maharashtra, producing developers, researchers, and innovators who give back to the community.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : (
        <>
          <Section title="Founders" members={founders} />
          <Section title="Faculty Coordinators" members={faculty} compact />
        </>
      )}
    </div>
  );
};

export default About;
