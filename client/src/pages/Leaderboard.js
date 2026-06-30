import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard } from "../services/api";

const RankBadge = ({ rank }) => {
  const styles = {
    1: "bg-yellow-400 text-black",
    2: "bg-gray-300 text-black",
    3: "bg-amber-600 text-white",
  };
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
      styles[rank] || "bg-gray-800 text-gray-400"
    }`}>
      {rank}
    </div>
  );
};

const Leaderboard = () => {
  const [period, setPeriod] = useState("all");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard({ period })
      .then((res) => setStudents(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Top Contributors</p>
      <h1 className="text-4xl font-bold text-white mb-8">Leaderboard</h1>

      <div className="flex gap-2 mb-10">
        {[
          { value: "all", label: "All-Time" },
          { value: "month", label: "This Month" },
        ].map((opt) => (
          <button key={opt.value} onClick={() => setPeriod(opt.value)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              period === opt.value
                ? "bg-white text-black border-white font-semibold"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-600 text-sm">No data yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((s, i) => (
            <Link key={s._id} to={`/profile/${s._id}`}
              className="border border-gray-800 rounded-xl p-4 bg-gray-900 hover:border-gray-600 transition-colors flex items-center gap-4">
              <RankBadge rank={i + 1} />
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{s.name}</p>
                <p className="text-gray-500 text-xs">Batch {s.batch}</p>
              </div>
              <p className="text-white font-bold text-lg shrink-0">{s.points}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;