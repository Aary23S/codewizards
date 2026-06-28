import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, getEvents, getAnnouncements } from "../services/api";

// ── Stat Card ──────────────────────────────────────────────
const StatCard = ({ value, label }) => (
  <div className="border border-gray-800 rounded-xl p-6 text-center bg-gray-900">
    <div className="text-4xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

// ── Project Card ───────────────────────────────────────────
const ProjectCard = ({ project }) => (
  <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3 hover:border-gray-600 transition-colors">
    <h3 className="text-white font-semibold text-lg">{project.title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed flex-1">{project.description}</p>
    <div className="flex flex-wrap gap-2">
      {project.techStack?.map((tech) => (
        <span key={tech} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
          {tech}
        </span>
      ))}
    </div>
    <div className="flex gap-3 mt-2">
      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noreferrer"
          className="text-xs border border-gray-700 text-gray-300 hover:text-white hover:border-white px-3 py-1 rounded-lg transition-colors">
          GitHub
        </a>
      )}
      {project.demoUrl && (
        <a href={project.demoUrl} target="_blank" rel="noreferrer"
          className="text-xs border border-gray-700 text-gray-300 hover:text-white hover:border-white px-3 py-1 rounded-lg transition-colors">
          Live Demo
        </a>
      )}
    </div>
  </div>
);

// ── Event Card ─────────────────────────────────────────────
const EventCard = ({ event }) => (
  <div className="border border-gray-800 rounded-xl p-5 bg-gray-900 hover:border-gray-600 transition-colors">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">{event.type}</span>
        <h3 className="text-white font-semibold">{event.title}</h3>
        <p className="text-gray-400 text-sm mt-1">{event.description}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
        event.status === "upcoming"
          ? "bg-white text-black font-semibold"
          : "bg-gray-800 text-gray-400"
      }`}>
        {event.status}
      </span>
    </div>
    <div className="mt-3 text-xs text-gray-600">
      {new Date(event.date).toDateString()} {event.venue && `· ${event.venue}`}
    </div>
  </div>
);

// ── Home Page ──────────────────────────────────────────────
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
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pt-24 pb-20 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          D.Y. Patil Agriculture & Technical University, Talsande
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Code.<br />
          <span className="text-gray-400">Build.</span><br />
          Grow.
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          CodeWizards is the official coding club connecting students with seniors,
          projects, and opportunities that matter.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/connect"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
            Find a Mentor
          </Link>
          <Link to="/projects"
            className="border border-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:border-white transition-colors">
            View Projects
          </Link>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="400+" label="Active Members" />
          <StatCard value="2023" label="Founded" />
          <StatCard value="10+" label="Projects Built" />
          <StatCard value="5+" label="Events Conducted" />
        </div>
      </section>

      {/* ── Announcements ────────────────────────────────── */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Announcements</h2>
          <div className="flex flex-col gap-3">
            {announcements.map((a) => (
              <div key={a._id}
                className={`border rounded-lg px-5 py-4 flex items-start gap-3 ${
                  a.important
                    ? "border-white bg-gray-900"
                    : "border-gray-800 bg-gray-900"
                }`}>
                {a.important && (
                  <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-semibold shrink-0 mt-0.5">
                    Important
                  </span>
                )}
                <div>
                  <p className="text-white font-medium text-sm">{a.title}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Projects ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">Featured Projects</h2>
          <Link to="/projects" className="text-sm text-gray-400 hover:text-white transition-colors">
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-600 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </section>

      {/* ── Events ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">Recent & Upcoming Events</h2>
          <Link to="/events" className="text-sm text-gray-400 hover:text-white transition-colors">
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-600 text-sm">Loading...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((e) => <EventCard key={e._id} event={e} />)}
          </div>
        )}
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="border-t border-gray-800 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to connect?</h2>
        <p className="text-gray-400 mb-8">Find seniors who can guide you in your domain.</p>
        <Link to="/connect"
          className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
          Browse Seniors
        </Link>
      </section>

    </div>
  );
};

export default Home;