import { useEffect, useState } from "react";
import { getResources } from "../services/api";

const CATEGORIES = ["All", "PDF", "GitHub", "YouTube", "Docs", "Other"];

const shellCard =
  "rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.18)]";

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
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-14 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-12%] top-[18%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className={`${shellCard} overflow-hidden px-6 py-8 md:px-8 md:py-10`}>
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Learn</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Resources</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
            A unified library for guides, references, and learning materials across the community.
          </p>
        </section>

        <section className={`${shellCard} mt-6 p-6 md:p-7`}>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                  category === item
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className={`${shellCard} p-6 text-sm text-white/55`}>Loading...</div>
          ) : resources.length === 0 ? (
            <div className={`${shellCard} p-6 text-sm text-white/55`}>
              No resources yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {resources.map((resource) => (
                <a
                  key={resource._id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                className={`${shellCard} group block p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{resource.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        {resource.description || "Open this resource for more details."}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/55">
                      {resource.category}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Open resource
                    </span>
                    {resource.domain && <span>{resource.domain}</span>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Resources;
