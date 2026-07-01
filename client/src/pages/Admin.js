import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getUsers, suspendUser, deleteUser,
  getProjects, createOpportunity, deleteOpportunity, updateOpportunity,
  getEvents, getAnnouncements, getResources,
  getTimeline, deleteTimeline,
  getGallery, deleteGalleryItem,
  getDoubts, deleteDoubt,
  getBlogs, deleteBlog,
  getOpportunities,
  getPointRules, updatePointRule,
  getTeam, createTeamMember, updateTeamMember, deleteTeamMember,
  getContact, updateContact,
} from "../services/api";
import api from "../services/api";

// ── Reusable input class ───────────────────────────────────
const ic = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400 w-full";

// ── Stat Box ───────────────────────────────────────────────
const StatBox = ({ label, value }) => (
  <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 text-center">
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">{label}</p>
  </div>
);

const TABS = [
  "overview", "users", "projects", "events",
  "announcements", "timeline", "gallery",
  "doubts", "blogs", "opportunities",
  "team", "contact", "points"
];

const Admin = () => {
  const { user: adminUser } = useAuth();
  const [tab, setTab] = useState("overview");

  // Data state
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [pointRules, setPointRules] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [contactInfo, setContactInfo] = useState({});

  // Form state
  const [newProject, setNewProject] = useState({ title: "", description: "", techStack: "", githubUrl: "", demoUrl: "", featured: false });
  const [newEvent, setNewEvent] = useState({ title: "", type: "workshop", description: "", date: "", venue: "", status: "upcoming" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "", important: false });
  const [newTimeline, setNewTimeline] = useState({ year: "", month: "", title: "", description: "" });
  const [newGallery, setNewGallery] = useState({ title: "", imageUrl: "", category: "event", eventRef: "" });
  const [newTeamMember, setNewTeamMember] = useState({ name: "", role: "", category: "core", batch: "", domain: "", imageUrl: "", linkedin: "", github: "", order: 0 });
  const [editingRule, setEditingRule] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null); // { user, reason }

  useEffect(() => {
    Promise.all([
      getUsers(), getProjects(), getEvents(), getAnnouncements(),
      getTimeline(), getGallery(), getDoubts(), getBlogs(),
      getOpportunities(), getPointRules(), getTeam(), getContact(),
    ]).then(([u, p, e, a, tl, g, d, bl, op, pr, tm, ct]) => {
      setUsers(u.data.data);
      setProjects(p.data.data);
      setEvents(e.data.data);
      setAnnouncements(a.data.data);
      setTimeline(tl.data.data);
      setGallery(g.data.data);
      setDoubts(d.data.data);
      setBlogs(bl.data.data);
      setOpportunities(op.data.data);
      setPointRules(pr.data.data);
      setTeamMembers(tm.data.data);
      setContactInfo(ct.data.data || {});
    }).catch(console.error);
  }, []);

  // ── Handlers ───────────────────────────────────────────
  const handleSuspend = async () => {
    if (!suspendModal) return;
    const res = await suspendUser(suspendModal.user._id, {
      isSuspended: !suspendModal.user.isSuspended,
      suspendedReason: suspendModal.reason || "",
    });
    setUsers((prev) => prev.map((u) => u._id === res.data.data._id ? res.data.data : u));
    setSuspendModal(null);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const createProject = async () => {
    const res = await api.post("/projects", { ...newProject, techStack: newProject.techStack.split(",").map((s) => s.trim()) });
    setProjects([res.data.data, ...projects]);
    setNewProject({ title: "", description: "", techStack: "", githubUrl: "", demoUrl: "", featured: false });
  };

  const handleDeleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  const createEvent = async () => {
    const res = await api.post("/events", newEvent);
    setEvents([res.data.data, ...events]);
    setNewEvent({ title: "", type: "workshop", description: "", date: "", venue: "", status: "upcoming" });
  };

  const handleDeleteEvent = async (id) => {
    await api.delete(`/events/${id}`);
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const createAnnouncement = async () => {
    const res = await api.post("/announcements", newAnnouncement);
    setAnnouncements([res.data.data, ...announcements]);
    setNewAnnouncement({ title: "", body: "", important: false });
  };

  const handleDeleteAnnouncement = async (id) => {
    await api.delete(`/announcements/${id}`);
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
  };

  const createTimeline = async () => {
    const res = await api.post("/timeline", { ...newTimeline, year: Number(newTimeline.year) });
    setTimeline([...timeline, res.data.data].sort((a, b) => a.year - b.year));
    setNewTimeline({ year: "", month: "", title: "", description: "" });
  };

  const handleDeleteTimeline = async (id) => {
    await deleteTimeline(id);
    setTimeline((prev) => prev.filter((t) => t._id !== id));
  };

  const createGalleryItem = async () => {
    const res = await api.post("/gallery", newGallery);
    setGallery([res.data.data, ...gallery]);
    setNewGallery({ title: "", imageUrl: "", category: "event", eventRef: "" });
  };

  const handleDeleteGallery = async (id) => {
    await deleteGalleryItem(id);
    setGallery((prev) => prev.filter((g) => g._id !== id));
  };

  const handleDeleteDoubt = async (id) => {
    await deleteDoubt(id);
    setDoubts((prev) => prev.filter((d) => d._id !== id));
  };

  const handleDeleteBlog = async (id) => {
    await deleteBlog(id);
    setBlogs((prev) => prev.filter((b) => b._id !== id));
  };

  const handleDeleteOpportunity = async (id) => {
    await deleteOpportunity(id);
    setOpportunities((prev) => prev.filter((o) => o._id !== id));
  };

  const createTeamMemberHandler = async () => {
    const payload = {
      ...newTeamMember,
      batch: newTeamMember.batch ? Number(newTeamMember.batch) : undefined,
      domain: newTeamMember.domain ? newTeamMember.domain.split(",").map((d) => d.trim()) : [],
    };
    const res = await createTeamMember(payload);
    setTeamMembers([...teamMembers, res.data.data]);
    setNewTeamMember({ name: "", role: "", category: "core", batch: "", domain: "", imageUrl: "", linkedin: "", github: "", order: 0 });
  };

  const handleDeleteTeamMember = async (id) => {
    await deleteTeamMember(id);
    setTeamMembers((prev) => prev.filter((m) => m._id !== id));
  };

  const saveContact = async () => {
    const res = await updateContact(contactInfo);
    setContactInfo(res.data.data);
  };

  const saveRule = async (rule) => {
    const res = await updatePointRule(rule._id, { flatPoints: rule.flatPoints, tiers: rule.tiers });
    setPointRules((prev) => prev.map((r) => r._id === rule._id ? res.data.data : r));
    setEditingRule(null);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Admin</p>
      <h1 className="text-3xl font-bold text-white mb-10">Control Panel</h1>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 mb-10">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs px-4 py-2 rounded-full border capitalize transition-colors ${
              tab === t ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Users" value={users.length} />
          <StatBox label="Projects" value={projects.length} />
          <StatBox label="Events" value={events.length} />
          <StatBox label="Announcements" value={announcements.length} />
          <StatBox label="Blog Posts" value={blogs.length} />
          <StatBox label="Opportunities" value={opportunities.length} />
          <StatBox label="Doubts" value={doubts.length} />
          <StatBox label="Gallery Items" value={gallery.length} />
        </div>
      )}

      {/* ── USERS ── */}
      {tab === "users" && (
        <div className="flex flex-col gap-3">
          <p className="text-gray-500 text-xs mb-2">{users.length} total users</p>
          {users.map((u) => (
            <div key={u._id} className={`border rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4 flex-wrap ${u.isSuspended ? "border-red-900" : "border-gray-800"}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-medium">{u.name}</p>
                  {u.isSuspended && <span className="text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded-full">Suspended</span>}
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full capitalize">{u.role}</span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{u.email} · Batch {u.batch}</p>
                {u.suspendedReason && <p className="text-red-400 text-xs mt-1">Reason: {u.suspendedReason}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSuspendModal({ user: u, reason: u.suspendedReason || "" })}
                  className={`text-xs border px-3 py-1.5 rounded-lg transition-colors ${
                    u.isSuspended
                      ? "border-green-900 text-green-400 hover:border-green-400"
                      : "border-yellow-900 text-yellow-400 hover:border-yellow-400"
                  }`}>
                  {u.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
                {u._id !== adminUser?._id && (
                  <button onClick={() => handleDeleteUser(u._id)}
                    className="text-xs border border-red-900 text-red-400 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PROJECTS ── */}
      {tab === "projects" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Add Project</h2>
            <input className={ic} placeholder="Title *" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
            <textarea className={ic} placeholder="Description" rows={2} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
            <input className={ic} placeholder="Tech Stack (comma separated)" value={newProject.techStack} onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })} />
            <input className={ic} placeholder="GitHub URL" value={newProject.githubUrl} onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })} />
            <input className={ic} placeholder="Demo URL" value={newProject.demoUrl} onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={newProject.featured} onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })} className="accent-white" />
              Featured
            </label>
            <button onClick={createProject} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">Add Project</button>
          </div>
          <div className="flex flex-col gap-3">
            {projects.map((p) => (
              <div key={p._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{p.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{p.techStack?.join(", ")}</p>
                </div>
                <button onClick={() => handleDeleteProject(p._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg transition-colors shrink-0">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === "events" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Add Event</h2>
            <input className={ic} placeholder="Title *" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            <select className={ic} value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
              {["workshop", "hackathon", "contest", "seminar", "other"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <textarea className={ic} placeholder="Description" rows={2} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
            <input className={ic} type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
            <input className={ic} placeholder="Venue" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} />
            <select className={ic} value={newEvent.status} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={createEvent} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">Add Event</button>
          </div>
          <div className="flex flex-col gap-3">
            {events.map((e) => (
              <div key={e._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{e.title}</p>
                  <p className="text-gray-500 text-xs">{e.type} · {e.status} · {new Date(e.date).toDateString()}</p>
                </div>
                <button onClick={() => handleDeleteEvent(e._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg transition-colors shrink-0">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ANNOUNCEMENTS ── */}
      {tab === "announcements" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Add Announcement</h2>
            <input className={ic} placeholder="Title *" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
            <textarea className={ic} placeholder="Body" rows={2} value={newAnnouncement.body} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={newAnnouncement.important} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, important: e.target.checked })} className="accent-white" />
              Mark as Important
            </label>
            <button onClick={createAnnouncement} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">Post</button>
          </div>
          <div className="flex flex-col gap-3">
            {announcements.map((a) => (
              <div key={a._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{a.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{a.body}</p>
                </div>
                <button onClick={() => handleDeleteAnnouncement(a._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg shrink-0 transition-colors">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TIMELINE ── */}
      {tab === "timeline" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Add Milestone</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className={ic} placeholder="Year *" type="number" value={newTimeline.year} onChange={(e) => setNewTimeline({ ...newTimeline, year: e.target.value })} />
              <input className={ic} placeholder="Month (e.g. June)" value={newTimeline.month} onChange={(e) => setNewTimeline({ ...newTimeline, month: e.target.value })} />
            </div>
            <input className={ic} placeholder="Title *" value={newTimeline.title} onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })} />
            <textarea className={ic} placeholder="Description" rows={2} value={newTimeline.description} onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })} />
            <button onClick={createTimeline} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">Add Milestone</button>
          </div>
          <div className="flex flex-col gap-3">
            {timeline.map((t) => (
              <div key={t._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
                <div>
                  <p className="text-gray-500 text-xs">{t.month} {t.year}</p>
                  <p className="text-white font-medium">{t.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{t.description}</p>
                </div>
                <button onClick={() => handleDeleteTimeline(t._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg shrink-0 transition-colors">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GALLERY ── */}
      {tab === "gallery" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Add Photo</h2>
            <input className={ic} placeholder="Title *" value={newGallery.title} onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })} />
            <input className={ic} placeholder="Image URL *" value={newGallery.imageUrl} onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })} />
            <select className={ic} value={newGallery.category} onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}>
              {["event", "poster", "team", "other"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className={ic} placeholder="Event Reference (optional)" value={newGallery.eventRef} onChange={(e) => setNewGallery({ ...newGallery, eventRef: e.target.value })} />
            <button onClick={createGalleryItem} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">Add Photo</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g._id} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
                <img src={g.imageUrl} alt={g.title} className="w-full h-32 object-cover" />
                <div className="p-3 flex items-center justify-between gap-2">
                  <p className="text-white text-xs font-medium truncate">{g.title}</p>
                  <button onClick={() => handleDeleteGallery(g._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-2 py-1 rounded-lg shrink-0 transition-colors">Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DOUBTS ── */}
      {tab === "doubts" && (
        <div className="flex flex-col gap-3">
          <p className="text-gray-500 text-xs mb-2">{doubts.length} total questions · Admin can delete any post</p>
          {doubts.map((d) => (
            <div key={d._id} className={`border rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4 ${d.resolved ? "border-green-900" : "border-gray-800"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {d.resolved && <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Resolved</span>}
                  {d.domain && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">{d.domain}</span>}
                </div>
                <p className="text-white font-medium text-sm">{d.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">By {d.author?.name} · {d.replies?.length} replies · {d.upvotes?.length} upvotes</p>
              </div>
              <button onClick={() => handleDeleteDoubt(d._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg shrink-0 transition-colors">Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ── BLOGS ── */}
      {tab === "blogs" && (
        <div className="flex flex-col gap-3">
          <p className="text-gray-500 text-xs mb-2">{blogs.length} total posts · Admin can delete any post</p>
          {blogs.map((b) => (
            <div key={b._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{b.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">By {b.author?.name} · {new Date(b.createdAt).toDateString()}</p>
                {b.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {b.tags.map((t) => <span key={t} className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                )}
              </div>
              <button onClick={() => handleDeleteBlog(b._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg shrink-0 transition-colors">Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ── OPPORTUNITIES ── */}
      {tab === "opportunities" && (
        <div className="flex flex-col gap-3">
          <p className="text-gray-500 text-xs mb-2">{opportunities.length} active opportunities · Admin can delete any post</p>
          {opportunities.map((o) => (
            <div key={o._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{o.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{o.company} · {o.type} · Posted by {o.postedBy?.name}</p>
              </div>
              <button onClick={() => handleDeleteOpportunity(o._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg shrink-0 transition-colors">Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ── TEAM ── */}
      {tab === "team" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Add Team Member</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className={ic} placeholder="Name *" value={newTeamMember.name} onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })} />
              <input className={ic} placeholder="Role (e.g. Co-Founder) *" value={newTeamMember.role} onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })} />
              <select className={ic} value={newTeamMember.category} onChange={(e) => setNewTeamMember({ ...newTeamMember, category: e.target.value })}>
                {["founder", "faculty", "core", "mentor"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className={ic} placeholder="Batch Year" type="number" value={newTeamMember.batch} onChange={(e) => setNewTeamMember({ ...newTeamMember, batch: e.target.value })} />
              <input className={ic} placeholder="Domains (comma separated)" value={newTeamMember.domain} onChange={(e) => setNewTeamMember({ ...newTeamMember, domain: e.target.value })} />
              <input className={ic} placeholder="Display Order (0 = first)" type="number" value={newTeamMember.order} onChange={(e) => setNewTeamMember({ ...newTeamMember, order: e.target.value })} />
              <input className={ic} placeholder="Image URL" value={newTeamMember.imageUrl} onChange={(e) => setNewTeamMember({ ...newTeamMember, imageUrl: e.target.value })} />
              <input className={ic} placeholder="LinkedIn URL" value={newTeamMember.linkedin} onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })} />
              <input className={ic} placeholder="GitHub URL" value={newTeamMember.github} onChange={(e) => setNewTeamMember({ ...newTeamMember, github: e.target.value })} />
            </div>
            <button onClick={createTeamMemberHandler} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">Add Member</button>
          </div>
          <div className="flex flex-col gap-3">
            {teamMembers.map((m) => (
              <div key={m._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{m.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{m.category} · {m.role} {m.batch ? `· Batch ${m.batch}` : ""}</p>
                </div>
                <button onClick={() => handleDeleteTeamMember(m._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg shrink-0 transition-colors">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTACT ── */}
      {tab === "contact" && (
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-4 max-w-xl">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">Edit Contact Info</h2>
          {[
            { key: "email", label: "Email", placeholder: "codewizards@dypatil.edu" },
            { key: "location", label: "Location", placeholder: "University name and address" },
            { key: "department", label: "Department", placeholder: "Department of CSE" },
            { key: "github", label: "GitHub URL", placeholder: "https://github.com/..." },
            { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/..." },
            { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
            { key: "twitter", label: "Twitter/X URL", placeholder: "https://twitter.com/..." },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-widest">{label}</label>
              <input className={ic} placeholder={placeholder}
                value={contactInfo[key] || ""}
                onChange={(e) => setContactInfo({ ...contactInfo, [key]: e.target.value })} />
            </div>
          ))}
          <button onClick={saveContact} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">Save Changes</button>
        </div>
      )}

      {/* ── POINTS ── */}
      {tab === "points" && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-500 text-sm mb-2">Changes apply immediately and retroactively to all past activity.</p>
          {pointRules.map((rule) => (
            <div key={rule._id} className="border border-gray-800 rounded-xl p-5 bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium text-sm">{rule.label}</p>
                {editingRule?._id !== rule._id && (
                  <button onClick={() => setEditingRule(JSON.parse(JSON.stringify(rule)))}
                    className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-3 py-1 rounded-lg transition-colors">
                    Edit
                  </button>
                )}
              </div>
              {editingRule?._id === rule._id ? (
                <div className="flex flex-col gap-3">
                  {rule.type === "flat" ? (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-gray-400">Points</label>
                      <input type="number" value={editingRule.flatPoints}
                        onChange={(e) => setEditingRule({ ...editingRule, flatPoints: Number(e.target.value) })}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-gray-400" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {editingRule.tiers.map((tier, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400 w-24 shrink-0">{tier.label}</span>
                          <span className="text-gray-600 text-xs">{tier.min}–{tier.max ?? "∞"}</span>
                          <input type="number" value={tier.points}
                            onChange={(e) => {
                              const newTiers = [...editingRule.tiers];
                              newTiers[idx] = { ...tier, points: Number(e.target.value) };
                              setEditingRule({ ...editingRule, tiers: newTiers });
                            }}
                            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm w-20 ml-auto focus:outline-none focus:border-gray-400" />
                          <span className="text-gray-600 text-xs">pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveRule(editingRule)} className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">Save</button>
                    <button onClick={() => setEditingRule(null)} className="border border-gray-700 text-gray-400 hover:border-white px-4 py-1.5 rounded-lg text-xs transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-xs">
                  {rule.type === "flat" ? `${rule.flatPoints} points` : rule.tiers.map((t) => `${t.label}: ${t.points}pts`).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── SUSPEND MODAL ── */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold mb-2">
              {suspendModal.user.isSuspended ? "Unsuspend" : "Suspend"} {suspendModal.user.name}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {suspendModal.user.isSuspended
                ? "This will restore the user's access immediately."
                : "The user will be blocked from all protected actions until unsuspended."}
            </p>
            {!suspendModal.user.isSuspended && (
              <textarea
                rows={2} placeholder="Reason for suspension (optional)"
                value={suspendModal.reason}
                onChange={(e) => setSuspendModal({ ...suspendModal, reason: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none mb-4"
              />
            )}
            <div className="flex gap-3">
              <button onClick={handleSuspend}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  suspendModal.user.isSuspended
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}>
                {suspendModal.user.isSuspended ? "Restore Access" : "Confirm Suspend"}
              </button>
              <button onClick={() => setSuspendModal(null)}
                className="border border-gray-700 text-gray-400 hover:border-white px-5 py-2 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;