import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../services/api";

const DOMAINS = ["All", "Web", "AI", "Machine Learning", "Flutter", "Backend",
  "Cyber Security", "Competitive Programming", "Research", "Open Source"];

const UserCard = ({ user }) => (
  <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:border-gray-600 transition-colors flex flex-col gap-3">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
        {user.name.charAt(0)}
      </div>
      <div>
        <p className="text-white font-semibold">{user.name}</p>
        <p className="text-gray-500 text-xs capitalize">
          {user.role} {user.batch ? `· Batch ${user.batch}` : ""}
        </p>
      </div>
      {user.isMentor && (
        <span className="ml-auto text-xs bg-white text-black px-2 py-0.5 rounded-full font-semibold shrink-0">
          Mentor
        </span>
      )}
    </div>

    {user.bio && <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{user.bio}</p>}

    {user.domain?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {user.domain.map((d) => (
          <span key={d} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">{d}</span>
        ))}
      </div>
    )}

    <Link to={`/profile/${user._id}`}
      className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-4 py-2 rounded-lg transition-colors text-center mt-1">
      View Profile
    </Link>
  </div>
);

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
    <div className="max-w-7xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Find Your Guide</p>
      <h1 className="text-4xl font-bold text-white mb-10">Connect</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        {/* Role */}
        <div className="flex gap-2">
          {["all", "senior", "alumni"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`text-xs px-4 py-2 rounded-full border capitalize transition-colors ${
                roleFilter === r ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}>
              {r === "all" ? "Everyone" : r}
            </button>
          ))}
        </div>

        {/* Mentor toggle */}
        <button onClick={() => setMentorOnly(!mentorOnly)}
          className={`text-xs px-4 py-2 rounded-full border transition-colors ${
            mentorOnly ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
          }`}>
          Mentors Only
        </button>
      </div>

      {/* Domain filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        {DOMAINS.map((d) => (
          <button key={d} onClick={() => setDomain(d)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              domain === d ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-600 text-sm">No users found with these filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((u) => <UserCard key={u._id} user={u} />)}
        </div>
      )}
    </div>
  );
};

export default Connect;