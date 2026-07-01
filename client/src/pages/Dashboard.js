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
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl";

const statusPillClass = (status) => {
  if (status === "accepted") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "rejected") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  }

  return "border-white/10 bg-white/5 text-white/60";
};

const QuickAction = ({ to, title, description, accent }) => (
  <Link
    to={to}
    className={`group ${shellCard} p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8`}
  >
    <div className={`mb-4 h-12 w-12 rounded-2xl ${accent} ring-1 ring-inset ring-white/10`} />
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="mt-1 text-sm leading-6 text-white/60">{description}</p>
    <p className="mt-4 text-xs uppercase tracking-[0.35em] text-cyan-200/70 transition group-hover:text-cyan-200">
      Open
    </p>
  </Link>
);

const RequestList = ({ title, emptyText, requests, onAction, showActions }) => (
  <section className={`${shellCard} p-6 md:p-7`}>
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">{title}</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Mentorship requests</h2>
      </div>
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
        {requests.length} items
      </span>
    </div>

    {requests.length === 0 ? (
      <p className="text-sm leading-6 text-white/55">{emptyText}</p>
    ) : (
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request._id}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 transition duration-300 hover:border-white/15 hover:bg-black/30"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
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
                <p className="max-w-2xl text-sm leading-6 text-white/65">{request.message}</p>
              </div>

              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.3em] ${statusPillClass(
                  request.status
                )}`}
              >
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
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-rose-400/50 hover:text-rose-200"
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
  const mentorRequests =
    user?.role === "student"
      ? requests
      : user?.role === "senior"
      ? requests
      : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[12%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[28%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8 lg:py-16">
        <section className={`${shellCard} relative overflow-hidden px-6 py-8 md:px-8 md:py-10`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_35%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">
                {roleLabel[user.role]} dashboard
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                Manage your profile, mentorship activity, and role-specific actions from one consistent workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/profile/${user._id}/edit`}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
              >
                Edit profile
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={`${shellCard} p-5`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Role</p>
            <p className="mt-3 text-2xl font-semibold text-white">{roleLabel[user.role]}</p>
          </div>
          <div className={`${shellCard} p-5`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Email</p>
            <p className="mt-3 break-all text-sm font-medium text-white/80">{user.email}</p>
          </div>
          <div className={`${shellCard} p-5`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Batch</p>
            <p className="mt-3 text-2xl font-semibold text-white">{user.batch || "N/A"}</p>
          </div>
        </section>

        <section className="mt-6">
          <div className={`${shellCard} p-6 md:p-7`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 text-2xl font-semibold text-black shadow-lg shadow-cyan-500/20">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/45">Profile snapshot</p>
                  <p className="mt-2 text-lg font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-white/55">
                    {roleLabel[user.role]} {user.batch ? `· Batch ${user.batch}` : ""}
                  </p>
                </div>
              </div>

              <Link
                to={`/profile/${user._id}`}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                View profile
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <QuickAction
            to="/connect"
            title="Find a mentor"
            description="Browse seniors, alumni, and mentors by domain and role."
            accent="bg-gradient-to-br from-cyan-400/30 to-blue-500/30"
          />
          <QuickAction
            to="/events"
            title="Upcoming events"
            description="Discover workshops, meetups, and registrations in one place."
            accent="bg-gradient-to-br from-fuchsia-400/30 to-indigo-500/30"
          />
          <QuickAction
            to="/resources"
            title="Learning resources"
            description="Jump into guides, docs, videos, and references."
            accent="bg-gradient-to-br from-emerald-400/30 to-cyan-500/30"
          />
        </section>

        {user.role === "student" && (
          <section className="mt-6">
            <RequestList
              title="Student view"
              emptyText="You do not have any mentorship requests yet. Start by finding a mentor from the connect page."
              requests={mentorRequests}
              showActions={false}
            />
          </section>
        )}

        {user.role === "senior" && (
          <section className="mt-6">
            <RequestList
              title="Senior view"
              emptyText="No pending requests yet."
              requests={mentorRequests}
              showActions
              onAction={handleStatus}
            />
          </section>
        )}

        {user.role === "alumni" && (
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className={`${shellCard} p-6 md:p-7`}>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Alumni space</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Support the next cohort</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
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

            <div className={`${shellCard} p-6 md:p-7`}>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Mentorship</p>
              <p className="mt-3 text-sm leading-6 text-white/60">
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
