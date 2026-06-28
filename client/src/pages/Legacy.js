import { useEffect, useState } from "react";
import { getTimeline } from "../services/api";

const Legacy = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimeline()
      .then((res) => setMilestones(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Our Journey</p>
      <h1 className="text-4xl font-bold text-white mb-16">Club Legacy</h1>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : (
        <div className="relative border-l border-gray-800 pl-8 flex flex-col gap-12">
          {milestones.map((m) => (
            <div key={m._id} className="relative">
              {/* Dot */}
              <div className="absolute -left-10 top-1 w-3 h-3 rounded-full bg-white border-2 border-black" />
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                {m.month ? `${m.month} ${m.year}` : m.year}
              </p>
              <h3 className="text-white font-semibold text-lg mb-2">{m.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Legacy;