import { useEffect, useState } from "react";
import { getGallery } from "../services/api";

const categories = ["all", "event", "poster", "team", "other"];

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery()
      .then((res) => setItems(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Moments</p>
      <h1 className="text-4xl font-bold text-white mb-8">Gallery</h1>

      <div className="flex gap-3 mb-10 flex-wrap">
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors capitalize ${
              filter === c
                ? "bg-white text-black border-white font-semibold"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div key={item._id} className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900 group">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4">
                <p className="text-white text-sm font-medium">{item.title}</p>
                {item.eventRef && <p className="text-gray-500 text-xs mt-1">{item.eventRef}</p>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-600 text-sm col-span-3">No items found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;