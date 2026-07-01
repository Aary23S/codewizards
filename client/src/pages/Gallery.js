import { useEffect, useState } from "react";
import { getGallery } from "../services/api";

const categories = ["all", "event", "poster", "team", "other"];

const GalleryCard = ({ item, index }) => (
  <div
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    style={{ transitionDelay: `${index * 40}ms` }}
  >
    <img
      src={item.imageUrl}
      alt={item.title}
      className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
      <p className="text-sm font-semibold text-white">{item.title}</p>
      {item.eventRef && <p className="mt-1 text-xs text-white/55">{item.eventRef}</p>}
    </div>
  </div>
);

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

  const filtered = filter === "all" ? items : items.filter((item) => item.category === filter);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Moments</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Gallery, presented as a visual grid.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Same gallery data, clearer media presentation, better spacing, and a more premium feel.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
              filter === category
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => (
            <GalleryCard key={item._id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          No items found.
        </div>
      )}
    </div>
  );
};

export default Gallery;
