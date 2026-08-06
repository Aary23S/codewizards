// codewizards/client/src/pages/Resources.js
import { useEffect, useState } from "react";
import { getResources } from "../services/api";

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20";

const normalize = (value) => (value || "").toString().trim().toLowerCase();
const deriveBadges = (resource) => {
  const text = [resource.title, resource.description, resource.category, resource.domain, resource.url]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const badges = [];
  const addBadge = (value) => {
    if (!badges.includes(value)) badges.push(value);
  };

  if (text.includes("beginner") || text.includes("starter") || text.includes("intro")) addBadge("Beginner");
  if (text.includes("interview") || text.includes("placement") || text.includes("dsa") || text.includes("cp")) {
    addBadge("Interview Prep");
  }
  if (text.includes("official") || text.includes("docs") || text.includes("reference")) addBadge("Core Reference");
  if (text.includes("youtube") || text.includes("video")) addBadge("Video");
  if (text.includes("github") || text.includes("repo")) addBadge("Repo");
  if (!badges.length && resource.category) addBadge(resource.category);
  return badges;
};

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState("all");
  const [domain, setDomain] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getResources()
      .then((res) => setResources(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(resources.map((item) => item.category).filter(Boolean))].sort((a, b) => {
    if (a === "all") return -1;
    if (b === "all") return 1;
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
  const domains = [
    "all",
    ...new Set(resources.map((item) => item.domain).filter(Boolean).map((item) => item.toString().trim()).filter(Boolean)),
  ].sort((a, b) => {
    if (a === "all") return -1;
    if (b === "all") return 1;
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  const filteredResources = resources.filter((resource) => {
    const categoryMatch = category === "all" || normalize(resource.category) === category;
    const domainMatch = domain === "all" || normalize(resource.domain) === domain;
    return categoryMatch && domainMatch;
  });

  const groupedResources = filteredResources.reduce((acc, resource) => {
    const key = resource.category?.trim() || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(resource);
    return acc;
  }, {});

  const groupOrder = ["PDF", "GitHub", "YouTube", "Docs", "Other"];
  const orderedGroups = [
    ...groupOrder.filter((key) => groupedResources[key]).map((key) => [key, groupedResources[key]]),
    ...Object.entries(groupedResources)
      .filter(([key]) => !groupOrder.includes(key))
      .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase())),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-14 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-[-8%] left-[26%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className={`${shellCard} overflow-hidden p-7 md:p-8`}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Learn</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">Resources</h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
                A unified library for guides, references, and learning materials across the community.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Items</p>
                <p className="mt-2 text-2xl font-semibold text-white">{resources.length}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Types</p>
                <p className="mt-2 text-2xl font-semibold text-white">{Math.max(categories.length - 1, 0)}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Domains</p>
                <p className="mt-2 text-2xl font-semibold text-white">{Math.max(domains.length - 1, 0)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${shellCard} mt-6 p-6 md:p-7`}>
          <div className="space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Type</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(normalize(item))}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
                      category === normalize(item)
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item === "all" ? "All" : item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Domain</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {domains.map((item) => (
                  <button
                    key={item}
                    onClick={() => setDomain(normalize(item))}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
                      domain === normalize(item)
                        ? "border-amber-300/70 bg-amber-300 text-black"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item === "all" ? "All" : item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className={`${shellCard} p-6 text-sm text-white/55`}>Loading...</div>
          ) : filteredResources.length === 0 ? (
            <div className={`${shellCard} p-6 text-sm text-white/55`}>
              No resources match the current filters.
            </div>
          ) : (
            <div className="space-y-6">
              {orderedGroups.map(([groupName, groupItems]) => (
                <section key={groupName}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">{groupName}</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">{groupItems.length} items</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    {groupItems.map((resource) => {
                      const host = (() => {
                        try {
                          return resource.url ? new URL(resource.url).host.replace(/^www\./, "") : "";
                        } catch {
                          return "";
                        }
                      })();
                      const badges = deriveBadges(resource);

                      return (
                        <a
                          key={resource._id}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`${shellCard} block p-6`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                                {resource.category || "Resource"}
                              </p>
                              <p className="mt-3 text-xl font-semibold text-white">{resource.title}</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/55">
                              Open
                            </span>
                          </div>

                          {host && (
                            <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-white/45">{host}</p>
                          )}

                          <p className="mt-4 text-sm leading-6 text-white/60">
                            {resource.description || "Open this resource for more details."}
                          </p>

                          {badges.length > 0 && (
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                              {badges.slice(0, 3).map((badge) => (
                                <span
                                  key={badge}
                                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-cyan-100"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            {resource.domain && (
                              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-amber-100">
                                {resource.domain}
                              </span>
                            )}
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/50">
                              Open resource
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Resources;
