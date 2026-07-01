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
    <div className="relative flex items-start justify-between gap-4">
      <div className="min-w-0">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/40">{event.type}</span>
        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
        <p className="mt-2 text-sm leading-7 text-white/60">{event.description}</p>
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
);

const AnnouncementCard = ({ announcement, index }) => (
  <div
    className={`group relative overflow-hidden rounded-3xl border p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 ${
      announcement.important ? "border-white/20 bg-white/8" : "border-white/10 bg-white/5"
    }`}
    style={{ transitionDelay: `${index * 50}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex items-start gap-3">
      {announcement.important && (
        <span className="mt-0.5 shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
          Important
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-white">{announcement.title}</p>
        <p className="mt-1 text-sm leading-7 text-white/60">{announcement.body}</p>
      </div>
    </div>
  </div>
);

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, evtRes, annRes] = await Promise.all([
          getProjects({ featured: true }),
          getEvents(),
          getAnnouncements(),
        ]);
        setProjects(projRes.data.data);
        setEvents(evtRes.data.data.slice(0, 3));
        setAnnouncements(annRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[10rem] h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_40%)]" />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 md:pb-24 md:pt-28">
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
          <div className="grid gap-4">
            {announcements.map((announcement, index) => (
              <AnnouncementCard key={announcement._id} announcement={announcement} index={index} />
            ))}
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

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <SectionHeader
          eyebrow="Events"
          title="Recent and upcoming events"
          description="A compact view of the latest workshops, seminars, and activity around the club."
          action={
            <Link to="/events" className="text-sm text-white/55 transition-colors hover:text-white">
              View all →
            </Link>
          }
        />
        {loading ? (
          <p className="text-sm text-white/45">Loading...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        )}
      </section>

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
