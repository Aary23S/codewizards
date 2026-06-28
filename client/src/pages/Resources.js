import { useEffect, useState } from "react";
import { getResources } from "../services/api";

const CATEGORIES = ["All", "PDF", "GitHub", "YouTube", "Docs", "Other"];

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = category !== "All" ? { category } : {};
    setLoading(true);
    getResources(params)
      .then((res) => setResources(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Learn</p>
      <h1 className="text-4xl font-bold text-white mb-8">Resources</h1>

      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              category === c ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-600 text-sm">No resources yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resources.map((r) => (
            <a key={r._id} href={r.url} target="_blank" rel="noreferrer"
              className="border border-gray-800 rounded-xl p-5 bg-gray-900 hover:border-gray-600 transition-colors block">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-white font-semibold">{r.title}</p>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md shrink-0">{r.category}</span>
              </div>
              {r.description && <p className="text-gray-400 text-sm">{r.description}</p>}
              {r.domain && <p className="text-gray-600 text-xs mt-2">{r.domain}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;