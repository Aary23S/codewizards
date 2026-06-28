import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";  // add to existing imports
import { getMyMentorshipRequests, updateMentorshipStatus } from "../services/api"; // add to imports

// ── Section components ─────────────────────────────────────

const StudentSection = ({ user }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getMyMentorshipRequests().then((res) => setRequests(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/connect" className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
            <p className="text-white font-semibold">Find a Mentor</p>
            <p className="text-gray-500 text-xs mt-1">Browse seniors by domain</p>
          </Link>
          <Link to="/events" className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
            <p className="text-white font-semibold">Upcoming Events</p>
            <p className="text-gray-500 text-xs mt-1">Register for workshops</p>
          </Link>
          <Link to={`/profile/${user._id}`} className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
            <p className="text-white font-semibold">My Profile</p>
            <p className="text-gray-500 text-xs mt-1">View and edit your profile</p>
          </Link>
        </div>
      </div>

      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">My Mentorship Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600 text-sm">No requests yet. <Link to="/connect" className="text-white hover:underline">Find a mentor →</Link></p>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <div key={r._id} className="border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{r.mentorId?.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{r.message}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                  r.status === "accepted" ? "bg-white text-black font-semibold" :
                  r.status === "rejected" ? "bg-gray-800 text-red-400" :
                  "bg-gray-800 text-gray-400"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SeniorSection = ({ user }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getMyMentorshipRequests().then((res) => setRequests(res.data.data)).catch(console.error);
  }, []);

  const handleStatus = async (id, status) => {
    await updateMentorshipStatus(id, status);
    setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to={`/profile/${user._id}`} className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
            <p className="text-white font-semibold">My Profile</p>
            <p className="text-gray-500 text-xs mt-1">Update skills and availability</p>
          </Link>
          <Link to="/connect" className="border border-gray-700 rounded-lg p-4 hover:border-white transition-colors text-center">
            <p className="text-white font-semibold">Senior Directory</p>
            <p className="text-gray-500 text-xs mt-1">See how your profile appears</p>
          </Link>
        </div>
      </div>

      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Incoming Mentorship Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600 text-sm">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <div key={r._id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-white text-sm font-medium">{r.studentId?.name}</p>
                    <p className="text-gray-500 text-xs">Batch {r.studentId?.batch}</p>
                    <p className="text-gray-400 text-sm mt-1">{r.message}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                    r.status === "accepted" ? "bg-white text-black font-semibold" :
                    r.status === "rejected" ? "bg-gray-800 text-red-400" :
                    "bg-gray-800 text-gray-400"
                  }`}>{r.status}</span>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(r._id, "accepted")}
                      className="text-xs bg-white text-black px-3 py-1 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleStatus(r._id, "rejected")}
                      className="text-xs border border-gray-700 text-gray-400 hover:border-red-400 hover:text-red-400 px-3 py-1 rounded-lg transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
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