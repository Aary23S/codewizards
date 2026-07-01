import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../services/api";

const DOMAINS = [
  "All",
  "Web",
  "AI",
  "Machine Learning",
  "Flutter",
  "Backend",
  "Cyber Security",
  "Competitive Programming",
  "Research",
  "Open Source",
];

const shellCard =
  "rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.18)]";

const UserCard = ({ user }) => {
  const profileImage = user.image || user.avatar || user.photo || "";

  return (
    <div
      className={`${shellCard} group flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]`}
    >
      <div className="flex items-start gap-4">
        {profileImage ? (
          <img
            src={profileImage}
            alt={user.name}
            className="h-14 w-14 rounded-2xl border border-white/10 object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 text-lg font-semibold text-black shadow-lg shadow-cyan-500/20">
            {user.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-white">{user.name}</p>
            {user.isMentor && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-emerald-200">
                Mentor
              </span>
            )}
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/45">
            {user.role}
            {user.batch ? ` · Batch ${user.batch}` : ""}
          </p>
        </div>
      </div>

      {user.bio && <p className="mt-4 text-sm leading-6 text-white/65 line-clamp-3">{user.bio}</p>}

      {user.domain?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {user.domain.map((domain) => (
            <span
              key={domain}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65"
            >
              {domain}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-5">
        <Link
          to={`/profile/${user._id}`}
          className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          View profile
        </Link>
      </div>
    </div>
  );
};

const Connect = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("All");
  const [roleFilter, setRoleFilter] = useState("all");
  const [mentorOnly, setMentorOnly] = useState(false);

  useEffect(() => {
    const params = {};
    if (roleFilter !== "all") params.role = roleFilter;
    if (domain !== "All") params.domain = domain;
    if (mentorOnly) params.isMentor = true;

    setLoading(true);
    getUsers(params)
      .then((res) => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [domain, roleFilter, mentorOnly]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-14 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-12%] top-[18%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className={`${shellCard} overflow-hidden px-6 py-8 md:px-8 md:py-10`}>
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Find your guide</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Connect</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
                Browse students, seniors, and alumni with a cleaner directory that keeps the same mentor search flow.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Users</p>
                <p className="mt-2 text-2xl font-semibold text-white">{users.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Role</p>
                <p className="mt-2 text-2xl font-semibold text-white capitalize">{roleFilter}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Domain</p>
                <p className="mt-2 truncate text-2xl font-semibold text-white">{domain}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${shellCard} mt-6 p-6 md:p-7`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {["all", "senior", "alumni"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                    roleFilter === role
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {role === "all" ? "Everyone" : role}
                </button>
              ))}

              <button
                onClick={() => setMentorOnly((prev) => !prev)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                  mentorOnly
                    ? "border-cyan-200/40 bg-cyan-300/15 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                Mentors only
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((item) => (
                <button
                  key={item}
                  onClick={() => setDomain(item)}
                  className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.25em] transition ${
                    domain === item
                      ? "border-cyan-200/40 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className={`${shellCard} p-6 text-sm text-white/55`}>Loading...</div>
          ) : users.length === 0 ? (
            <div className={`${shellCard} p-6 text-sm text-white/55`}>
              No users found with these filters.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {users.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Connect;
