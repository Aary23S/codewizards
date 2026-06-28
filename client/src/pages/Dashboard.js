import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// ── Section components ─────────────────────────────────────

const StudentSection = ({ user }) => (
  <div className="flex flex-col gap-8">
    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/connect"
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">Find a Mentor</p>
          <p className="text-gray-500 text-xs mt-1">Browse seniors by domain</p>
        </Link>
        <Link to="/events"
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">Upcoming Events</p>
          <p className="text-gray-500 text-xs mt-1">Register for workshops</p>
        </Link>
        <Link to={`/profile/${user._id}`}
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">My Profile</p>
          <p className="text-gray-500 text-xs mt-1">View and edit your profile</p>
        </Link>
      </div>
    </div>

    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">My Mentorship Requests</h2>
      <p className="text-gray-600 text-sm">No requests yet. <Link to="/connect" className="text-white hover:underline">Find a mentor →</Link></p>
    </div>
  </div>
);

const SeniorSection = ({ user }) => (
  <div className="flex flex-col gap-8">
    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to={`/profile/${user._id}`}
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">My Profile</p>
          <p className="text-gray-500 text-xs mt-1">Update skills and availability</p>
        </Link>
        <Link to="/connect"
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">Senior Directory</p>
          <p className="text-gray-500 text-xs mt-1">See how your profile appears</p>
        </Link>
        <Link to="/events"
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">Events</p>
          <p className="text-gray-500 text-xs mt-1">View upcoming events</p>
        </Link>
      </div>
    </div>

    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Incoming Mentorship Requests</h2>
      <p className="text-gray-600 text-sm">No pending requests.</p>
    </div>
  </div>
);

const AlumniSection = ({ user }) => (
  <div className="flex flex-col gap-8">
    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to={`/profile/${user._id}`}
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">My Profile</p>
          <p className="text-gray-500 text-xs mt-1">Update career info and domains</p>
        </Link>
        <Link to="/connect"
          className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
          <p className="text-white font-semibold">Alumni Directory</p>
          <p className="text-gray-500 text-xs mt-1">See your alumni listing</p>
        </Link>
      </div>
    </div>

    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Mentorship Requests</h2>
      <p className="text-gray-600 text-sm">No pending requests.</p>
    </div>
  </div>
);

// ── Dashboard Page ──────────────────────────────────────────

const roleLabel = { student: "Student", senior: "Senior", alumni: "Alumni" };

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            {roleLabel[user.role]} Dashboard
          </p>
          <h1 className="text-3xl font-bold text-white">
            Welcome, {user.name.split(" ")[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="border border-gray-700 text-gray-400 hover:border-white hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Profile summary strip */}
      <div className="border border-gray-800 rounded-xl p-5 bg-gray-900 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-semibold">{user.name}</p>
            <p className="text-gray-500 text-xs">
              {roleLabel[user.role]} {user.batch ? `· Batch ${user.batch}` : ""}
            </p>
          </div>
        </div>
        <Link
          to={`/profile/${user._id}/edit`}
          className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-4 py-2 rounded-lg transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      {/* Role-specific sections */}
      {user.role === "student" && <StudentSection user={user} />}
      {user.role === "senior" && <SeniorSection user={user} />}
      {user.role === "alumni" && <AlumniSection user={user} />}
    </div>
  );
};

export default Dashboard;