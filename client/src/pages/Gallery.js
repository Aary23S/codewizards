// codewizards/client/src/pages/Gallery.js
import { useEffect, useRef, useState } from "react";
import { getGallery } from "../services/api";
import { useModalA11y } from "../hooks/useModalA11y";

const categories = ["all", "event", "poster", "team", "other"];

const GalleryCard = ({ item, index, onClick }) => {
  const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl];
  return (
    <div
      onClick={() => onClick(item)}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 cursor-pointer"
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <img
        src={images[0]}
        alt={item.title}
        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {images.length > 1 && (
        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {images.length} photos
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        {item.eventRef && <p className="mt-1 text-xs text-white/55">{item.eventRef}</p>}
      </div>
    </div>
  );
};

const LightboxModal = ({ item, onClose }) => {
  const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl];
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef(null);
  useModalA11y(containerRef, true, onClose);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      ref={containerRef}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — image viewer`}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4 backdrop-blur-md transition-all duration-300 outline-none"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-6 top-6 text-white/70 hover:text-white text-3xl font-light transition-colors"
      >
        &times;
      </button>

      {/* Main content container */}
      <div className="relative flex max-w-4xl w-full flex-col items-center justify-center">
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-4 text-white transition hover:bg-white/15 focus:outline-none hidden md:block"
            >
              &#10094;
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-4 text-white transition hover:bg-white/15 focus:outline-none hidden md:block"
            >
              &#10095;
            </button>
          </>
        )}

        {/* Current Image */}
        <div className="h-[60vh] max-w-full overflow-hidden rounded-3xl border border-white/10 bg-black/30 flex items-center justify-center">
          <img
            src={images[activeIdx]}
            alt={`${item.title} - ${activeIdx + 1}`}
            className="max-h-full max-w-full object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Title and stats */}
        <div className="mt-5 text-center text-white" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-semibold">{item.title}</h2>
          {item.eventRef && <p className="mt-1 text-sm text-white/55">{item.eventRef}</p>}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                aria-label={`Go to image ${idx + 1}`}
                aria-current={activeIdx === idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIdx === idx ? "w-6 bg-white" : "w-2 bg-white/35 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Mobile controls */}
        {images.length > 1 && (
          <div className="mt-6 flex gap-4 md:hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={handlePrev} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
              Prev
            </button>
            <button onClick={handleNext} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getGallery()
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.data);
      })
      .catch(console.error)
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = filter === "all" ? items : items.filter((item) => item.category === filter);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Moments</p>
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
        <p className="text-sm text-white/50">Loading...</p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => (
            <GalleryCard key={item._id} item={item} index={index} onClick={setActiveItem} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          No items found.
        </div>
      )}

      {activeItem && (
        <LightboxModal item={activeItem} onClose={() => setActiveItem(null)} />
      )}
    </div>
  );
};

export default Gallery;
