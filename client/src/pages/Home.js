// codewizards/client/src/pages/Home.js
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, getEvents, getAnnouncements } from "../services/api";

const StatCard = ({ value, label }) => (
  <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
    <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative">
      <div className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{value}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.28em] text-white/45">{label}</div>
    </div>
  </div>
);

const SectionHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">{description}</p>}
    </div>
    {action}
  </div>
);

const ProjectCard = ({ project, index }) => (
  <div
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    style={{ transitionDelay: `${index * 60}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex h-full flex-col gap-4">
      {project.featured && (
        <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-200">
          Featured
        </span>
      )}
      <h3 className="text-lg font-semibold text-white">{project.title}</h3>
      <p className="flex-1 text-sm leading-7 text-white/60">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.techStack?.map((tech) => (
          <span key={tech} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
            {tech}
          </span>
        ))}
      </div>
      <div className="flex gap-3 pt-1">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            GitHub
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            Live Demo
          </a>
        )}
      </div>
    </div>
  </div>
);

const EventCard = ({ event, index }) => (
  <div
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    style={{ transitionDelay: `${index * 60}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex flex-col gap-4">
      {event.imageUrl && (
        <div className="h-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/40">{event.type}</span>
          <h3 className="text-lg font-semibold text-white line-clamp-2">{event.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/60 line-clamp-3">{event.description}</p>
          <div className="mt-4 text-xs text-white/40">
            {new Date(event.date).toDateString()} {event.venue && `· ${event.venue}`}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            event.status === "upcoming" ? "bg-white text-black" : "bg-white/8 text-white/55"
          }`}
        >
          {event.status}
        </span>
      </div>
    </div>
  </div>
);

const AnnouncementCard = ({ announcement, index }) => (
  <div
    className={`announcement-card group relative overflow-hidden rounded-3xl border p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${
      announcement.important
        ? "border-amber-400/20 bg-gradient-to-br from-white/10 via-white/8 to-transparent"
        : "border-white/10 bg-white/5"
    }`}
    style={{ animationDelay: `${index * 90}ms`, transitionDelay: `${index * 50}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400/0 via-amber-300/60 to-sky-300/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex items-start gap-4">
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-xs font-semibold text-white/75">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {announcement.important && (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100">
              Important
            </span>
          )}
          {!announcement.important && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
              Update
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-white md:text-base">{announcement.title}</p>
        <p className="mt-2 text-sm leading-7 text-white/60">{announcement.body}</p>
      </div>
    </div>
  </div>
);

const HeroVisual = () => (
  <div className="hero-visual" aria-hidden="true">
    <div className="hero-visual__frame">
      <div className="hero-visual__stage">
        <div className="hero-visual__terminal">
          <div className="hero-visual__terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre className="hero-visual__code">
{`const magic = () => {
  return "CodeWizards";
}`}
          </pre>
          <div className="hero-visual__cursor" />
        </div>

        <div className="hero-visual__chip hero-visual__chip--one">C++</div>
        <div className="hero-visual__chip hero-visual__chip--two">Python</div>
        <div className="hero-visual__chip hero-visual__chip--three">AI</div>
        <div className="hero-visual__chip hero-visual__chip--four">Wizard</div>
      </div>
    </div>
  </div>
);

const CarouselShell = ({ title, eyebrow, description, action, items, renderItem, emptyMessage, loading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      setVisibleCount(width >= 1280 ? 3 : width >= 768 ? 2 : 1);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const maxCycle = Math.max(1, items.length - visibleCount + 1);
    if (activeIndex >= maxCycle) {
      setActiveIndex(0);
    }
  }, [activeIndex, items.length, visibleCount]);

  const maxIndex = Math.max(0, items.length - visibleCount);
  const safeIndex = Math.min(activeIndex, maxIndex);
  const slideWidth = 100 / visibleCount;
  const trackWidth = items.length * slideWidth;
  const translatePct = items.length > visibleCount ? safeIndex * slideWidth : 0;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
          {description && <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">{description}</p>}
        </div>
        {action}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">{emptyMessage}</div>
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === safeIndex
                      ? "w-8 bg-white"
                      : "w-2.5 bg-white/25 hover:bg-white/45"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.25em] text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((current) => Math.min(maxIndex, current + 1))}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.25em] text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-300 ease-out"
              style={{
                width: `${trackWidth}%`,
                transform: `translateX(-${translatePct}%)`,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className="min-w-0 shrink-0"
                  style={{ width: `${slideWidth}%` }}
                >
                  {renderItem(item, index)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [projRes, evtRes, annRes] = await Promise.all([
          getProjects({ featured: true }),
          getEvents(),
          getAnnouncements(),
        ]);
        if (cancelled) return;
        setProjects(projRes.data.data);
        setEvents(evtRes.data.data.slice(0, 3));
        setAnnouncements(annRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[10rem] h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_40%)]" />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 md:pb-24 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              D.Y. Patil Agriculture & Technical University, Talsande
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white md:text-7xl lg:text-8xl">
              Code.
              <span className="block text-white/55">Build.</span>
              <span className="block text-white/85">Grow.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
              CodeWizards is the official coding club connecting students with seniors, projects, and opportunities that matter.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/connect"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90"
              >
                Find a Mentor
              </Link>
              <Link
                to="/projects"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
              >
                View Projects
              </Link>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard value="400+" label="Active Members" />
          <StatCard value="2023" label="Founded" />
          <StatCard value="10+" label="Projects Built" />
          <StatCard value="5+" label="Events Conducted" />
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <SectionHeader
            eyebrow="Announcements"
            title="What the club needs to know"
            description="Short updates, important notices, and operational alerts."
          />
          <div className="announcement-shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="announcement-panel group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">Club Feed</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Updates that stay readable and feel alive.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 md:text-base">
                  Important notices rise to the top while the rest stay neatly stacked in a calm, premium feed.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Live status</p>
                    <p className="mt-2 text-lg font-semibold text-white">{announcements.length} posts</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Priority</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {announcements.some((item) => item.important) ? "Pinned items" : "General updates"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {announcements.map((announcement, index) => (
                <AnnouncementCard key={announcement._id} announcement={announcement} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <SectionHeader
          eyebrow="Featured Projects"
          title="Built by the club"
          description="Selected projects that show what students are shipping across different domains."
          action={
            <Link to="/projects" className="text-sm text-white/55 transition-colors hover:text-white">
              View all →
            </Link>
          }
        />
        {loading ? (
          <p className="text-sm text-white/45">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard key={project._id} project={project} index={index} />
            ))}
          </div>
        )}
      </section>

      <CarouselShell
        eyebrow="Events"
        title="Recent and upcoming events"
        description="A compact view of the latest workshops, seminars, and activity around the club."
        action={
          <Link to="/events" className="text-sm text-white/55 transition-colors hover:text-white">
            View all →
          </Link>
        }
        items={events}
        loading={loading}
        emptyMessage="No events found."
        renderItem={(event, index) => <EventCard event={event} index={index} />}
      />

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-12 text-center shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Connect</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Ready to connect?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
            Find seniors who can guide you in your domain or explore the club’s work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/connect"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90"
            >
              Browse Seniors
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
            >
              About the Club
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
