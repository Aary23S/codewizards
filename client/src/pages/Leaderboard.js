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
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${styles[rank] || "bg-white/10 text-white/45"}`}>
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
    <div className="relative mx-auto max-w-4xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Top Contributors</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Leaderboard, presented as a ranked feed.
        </h1>
      </div>

      <div className="mb-8 flex gap-2">
        {[{ value: "all", label: "All-Time" }, { value: "month", label: "This Month" }].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
              period === option.value
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : students.length > 0 ? (
        <div className="flex flex-col gap-3">
          {students.map((student, index) => (
            <Link key={student._id} to={`/profile/${student._id}`} className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
              <RankBadge rank={index + 1} />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                {student.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{student.name}</p>
                <p className="text-xs text-white/40">Batch {student.batch}</p>
              </div>
              <p className="text-lg font-semibold text-white">{student.points}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/45">No data yet.</p>
      )}
    </div>
  );
};

export default Leaderboard;
