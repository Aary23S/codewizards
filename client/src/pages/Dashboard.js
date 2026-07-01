import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyMentorshipRequests, updateMentorshipStatus } from "../services/api";

const roleLabel = {
  student: "Student",
  senior: "Senior",
  alumni: "Alumni",
};

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]";

const QuickAction = ({ to, title, description }) => (
  <Link
    to={to}
    className={`${shellCard} block p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
  >
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/45">Open</p>
  </Link>
);

const RequestList = ({ title, emptyText, requests, onAction, showActions }) => (
  <section className={`${shellCard} p-6 md:p-7`}>
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">{title}</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Mentorship requests</h2>
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">{requests.length} items</p>
    </div>

    {requests.length === 0 ? (
      <p className="text-sm leading-7 text-white/55">{emptyText}</p>
    ) : (
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request._id}
            className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 transition-all duration-300 hover:border-white/20"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-white">
                    {request.mentorId?.name || request.studentId?.name || "Member"}
                  </p>
                  {request.studentId?.batch && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                      Batch {request.studentId.batch}
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{request.message}</p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/55">
                {request.status}
              </span>
            </div>

            {showActions && request.status === "pending" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => onAction(request._id, "accepted")}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-100"
                >
                  Accept
                </button>
                <button
                  onClick={() => onAction(request._id, "rejected")}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getMyMentorshipRequests()
      .then((res) => setRequests(res.data.data))
      .catch(console.error);
  }, []);

  const handleStatus = async (id, status) => {
    await updateMentorshipStatus(id, status);
    setRequests((prev) => prev.map((item) => (item._id === id ? { ...item, status } : item)));
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const mentorRequests = user?.role === "student" || user?.role === "senior" ? requests : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <div className="relative mb-14 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            {roleLabel[user.role]} Dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
            Manage your profile, mentorship activity, and role-specific actions from one consistent workspace.
          </p>
        </div>

        <section className="mb-14 grid gap-5 md:grid-cols-3">
          <div className={shellCard + " p-6"}>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Role</p>
            <p className="mt-3 text-2xl font-semibold text-white">{roleLabel[user.role]}</p>
          </div>
          <div className={shellCard + " p-6"}>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Email</p>
            <p className="mt-3 break-all text-sm text-white/70">{user.email}</p>
          </div>
          <div className={shellCard + " p-6"}>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Batch</p>
            <p className="mt-3 text-2xl font-semibold text-white">{user.batch || "N/A"}</p>
          </div>
        </section>

        <section className="mb-14 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={shellCard + " p-6 md:p-7"}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700 text-2xl font-semibold text-white">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Profile snapshot</p>
                  <p className="mt-2 text-lg font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-white/55">
                    {roleLabel[user.role]} {user.batch ? `· Batch ${user.batch}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/profile/${user._id}/edit`}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
                >
                  Edit profile
                </Link>
                <Link
                  to={`/profile/${user._id}`}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  View profile
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className={shellCard + " p-6 md:p-7"}>
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">Quick Links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70" to="/connect">
                Connect
              </Link>
              <Link className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70" to="/events">
                Events
              </Link>
              <Link className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70" to="/resources">
                Resources
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-14 grid gap-5 lg:grid-cols-3">
          <QuickAction
            to="/connect"
            title="Find a mentor"
            description="Browse seniors, alumni, and mentors by domain and role."
          />
          <QuickAction
            to="/events"
            title="Upcoming events"
            description="Discover workshops, meetups, and registrations in one place."
          />
          <QuickAction
            to="/resources"
            title="Learning resources"
            description="Jump into guides, docs, videos, and references."
          />
        </section>

        {user.role === "student" && (
          <section className="mb-14">
            <RequestList
              title="Student View"
              emptyText="You do not have any mentorship requests yet. Start by finding a mentor from the connect page."
              requests={mentorRequests}
              showActions={false}
            />
          </section>
        )}

        {user.role === "senior" && (
          <section className="mb-14">
            <RequestList
              title="Senior View"
              emptyText="No pending requests yet."
              requests={mentorRequests}
              showActions
              onAction={handleStatus}
            />
          </section>
        )}

        {user.role === "alumni" && (
          <section className="mb-14 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className={shellCard + " p-6 md:p-7"}>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Alumni Space</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Support the next cohort</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Keep your profile current, stay visible in the mentor directory, and share guidance with students and seniors who need it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/profile/${user._id}`}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
                >
                  Review profile
                </Link>
                <Link
                  to="/connect"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Open directory
                </Link>
              </div>
            </div>

            <div className={shellCard + " p-6 md:p-7"}>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Mentorship</p>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Alumni requests will appear here once students reach out for guidance.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
