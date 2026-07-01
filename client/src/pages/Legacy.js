import { useEffect, useState } from "react";
import { getTimeline } from "../services/api";

const MilestoneCard = ({ milestone, index }) => (
  <div
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    style={{ transitionDelay: `${index * 60}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative">
      <div className="mb-4 text-[11px] uppercase tracking-[0.28em] text-white/40">
        {milestone.month ? `${milestone.month} ${milestone.year}` : milestone.year}
      </div>
      <h3 className="text-xl font-semibold text-white">{milestone.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/60">{milestone.description}</p>
    </div>
  </div>
);

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
    <div className="relative mx-auto max-w-5xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-14 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Our Journey</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Club legacy, presented like a living timeline.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Milestones, achievements, and turning points in a cleaner, more visual narrative.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : milestones.length > 0 ? (
        <div className="relative border-l border-white/10 pl-8">
          <div className="absolute left-[-7px] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div className="flex flex-col gap-6">
            {milestones.map((milestone, index) => (
              <div key={milestone._id} className="relative">
                <div className="absolute -left-[41px] top-6 h-4 w-4 rounded-full border border-white/20 bg-black shadow-[0_0_0_6px_rgba(255,255,255,0.04)]" />
                <MilestoneCard milestone={milestone} index={index} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          No legacy milestones found.
        </div>
      )}
    </div>
  );
};

export default Legacy;
