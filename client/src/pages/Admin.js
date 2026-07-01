import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, {
  getUsers,
  suspendUser,
  deleteUser,
  getProjects,
  createOpportunity,
  deleteOpportunity,
  updateOpportunity,
  getEvents,
  getAnnouncements,
  getResources,
  getTimeline,
  deleteTimeline,
  getGallery,
  deleteGalleryItem,
  getDoubts,
  deleteDoubt,
  getBlogs,
  deleteBlog,
  getOpportunities,
  getPointRules,
  updatePointRule,
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getContact,
  updateContact,
} from "../services/api";

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20";
const fieldClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition duration-200 focus:border-cyan-300/60 focus:bg-white/8";

const TABS = [
  "overview",
  "users",
  "projects",
  "events",
  "announcements",
  "timeline",
  "gallery",
  "doubts",
  "blogs",
  "opportunities",
  "team",
  "contact",
  "points",
];

const TabButton = ({ active, children, ...props }) => (
  <button
    {...props}
    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
      active
        ? "border-white bg-white text-black"
        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const StatBox = ({ label, value }) => (
  <div className={`${shellCard} p-5 md:p-6`}>
    <p className="text-3xl font-semibold text-white">{value}</p>
    <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-white/45">{label}</p>
  </div>
);

const Section = ({ title, description, children, className = "" }) => (
  <section className={`${shellCard} ${className} p-6 md:p-7`}>
    <div className="mb-5 flex flex-col gap-2">
      <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">{title}</p>
      {description && <p className="text-sm leading-6 text-white/60">{description}</p>}
    </div>
    {children}
  </section>
);

const Admin = () => {
  const { user: adminUser } = useAuth();
  const [tab, setTab] = useState("overview");

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [resources, setResources] = useState([]);
  const [pointRules, setPointRules] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [contactInfo, setContactInfo] = useState({});

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    demoUrl: "",
    featured: false,
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "workshop",
    description: "",
    date: "",
    venue: "",
    status: "upcoming",
  });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "", important: false });
  const [newTimeline, setNewTimeline] = useState({ year: "", month: "", title: "", description: "" });
  const [newGallery, setNewGallery] = useState({ title: "", imageUrl: "", category: "event", eventRef: "" });
  const [newOpportunity, setNewOpportunity] = useState({
    title: "",
    company: "",
    type: "internship",
    domain: "",
    description: "",
    applyLink: "",
    deadline: "",
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    role: "",
    subtitle: "",
    teamYear: "",
    category: "core",
    batch: "",
    domain: "",
    imageUrl: "",
    linkedin: "",
    github: "",
    order: 0,
  });
  const [newTeamImageFile, setNewTeamImageFile] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [editingTeamImageFile, setEditingTeamImageFile] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);

  useEffect(() => {
    Promise.all([
      getUsers(),
      getProjects(),
      getEvents(),
      getAnnouncements(),
      getTimeline(),
      getGallery(),
      getDoubts(),
      getBlogs(),
      getOpportunities(),
      getResources(),
      getPointRules(),
      getTeam(),
      getContact(),
    ])
      .then(([u, p, e, a, tl, g, d, bl, op, r, pr, tm, ct]) => {
        setUsers(u.data.data);
        setProjects(p.data.data);
        setEvents(e.data.data);
        setAnnouncements(a.data.data);
        setTimeline(tl.data.data);
        setGallery(g.data.data);
        setDoubts(d.data.data);
        setBlogs(bl.data.data);
        setOpportunities(op.data.data);
        setResources(r.data.data);
        setPointRules(pr.data.data);
        setTeamMembers(tm.data.data);
        setContactInfo(ct.data.data || {});
      })
      .catch(console.error);
  }, []);

  const handleSuspend = async () => {
    if (!suspendModal) return;
    const res = await suspendUser(suspendModal.user._id, {
      isSuspended: !suspendModal.user.isSuspended,
      suspendedReason: suspendModal.reason || "",
    });
    setUsers((prev) => prev.map((u) => (u._id === res.data.data._id ? res.data.data : u)));
    setSuspendModal(null);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const createProject = async () => {
    const res = await api.post("/projects", {
      ...newProject,
      techStack: newProject.techStack.split(",").map((s) => s.trim()),
    });
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

  const saveOpportunityUpdate = async () => {
    const res = await updateOpportunity(editingOpportunity._id, editingOpportunity);
    setOpportunities((prev) =>
      prev.map((item) => (item._id === editingOpportunity._id ? res.data.data : item))
    );
    setEditingOpportunity(null);
  };

  const createOpportunityHandler = async () => {
    const payload = { ...newOpportunity };
    if (!payload.deadline) delete payload.deadline;
    const res = await createOpportunity(payload);
    setOpportunities((prev) => [res.data.data, ...prev]);
    setNewOpportunity({
      title: "",
      company: "",
      type: "internship",
      domain: "",
      description: "",
      applyLink: "",
      deadline: "",
    });
  };

  const handleDeleteOpportunity = async (id) => {
    await deleteOpportunity(id);
    setOpportunities((prev) => prev.filter((o) => o._id !== id));
  };

  const createTeamMemberHandler = async () => {
    const formData = new FormData();
    Object.entries(newTeamMember).forEach(([key, value]) => {
      if (key === "domain") {
        formData.append(
          key,
          value ? value.split(",").map((d) => d.trim()).filter(Boolean).join(",") : ""
        );
        return;
      }
      if (key === "batch" || key === "order") {
        formData.append(key, value === "" ? "" : String(value));
        return;
      }
      formData.append(key, value ?? "");
    });
    if (newTeamImageFile) formData.append("image", newTeamImageFile);
    const res = await createTeamMember(formData);
    setTeamMembers([...teamMembers, res.data.data]);
    setNewTeamMember({
      name: "",
      role: "",
      subtitle: "",
      teamYear: "",
      category: "core",
      batch: "",
      domain: "",
      imageUrl: "",
      linkedin: "",
      github: "",
      order: 0,
    });
    setNewTeamImageFile(null);
  };

  const saveTeamMemberUpdate = async () => {
    const payload = new FormData();
    Object.entries(editingTeamMember || {}).forEach(([key, value]) => {
      if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return;
      if (key === "domain") {
        payload.append(key, Array.isArray(value) ? value.join(", ") : value || "");
        return;
      }
      if (key === "batch" || key === "order") {
        payload.append(key, value === "" || value == null ? "" : String(value));
        return;
      }
      payload.append(key, value ?? "");
    });
    if (editingTeamImageFile) payload.append("image", editingTeamImageFile);
    const res = await updateTeamMember(editingTeamMember._id, payload);
    setTeamMembers((prev) =>
      prev.map((member) => (member._id === editingTeamMember._id ? res.data.data : member))
    );
    setEditingTeamMember(null);
    setEditingTeamImageFile(null);
  };

  const handleDeleteTeamMember = async (id) => {
    await deleteTeamMember(id);
    setTeamMembers((prev) => prev.filter((member) => member._id !== id));
  };

  const saveContact = async () => {
    const res = await updateContact(contactInfo);
    setContactInfo(res.data.data);
  };

  const saveRule = async (rule) => {
    const res = await updatePointRule(rule._id, { flatPoints: rule.flatPoints, tiers: rule.tiers });
    setPointRules((prev) => prev.map((item) => (item._id === rule._id ? res.data.data : item)));
    setEditingRule(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-[-8%] left-[28%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className={`${shellCard} overflow-hidden p-7 md:p-8`}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Admin</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">Control Panel</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
                Manage all public content, users, and community systems from one unified console.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Users</p>
                <p className="mt-2 text-2xl font-semibold text-white">{users.length}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Content</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {projects.length + events.length + blogs.length}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Team</p>
                <p className="mt-2 text-2xl font-semibold text-white">{teamMembers.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${shellCard} mt-6 p-6 md:p-7`}>
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => (
              <TabButton key={item} active={tab === item} onClick={() => setTab(item)}>
                {item}
              </TabButton>
            ))}
          </div>
        </section>

        {tab === "overview" && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatBox label="Users" value={users.length} />
            <StatBox label="Projects" value={projects.length} />
            <StatBox label="Events" value={events.length} />
            <StatBox label="Announcements" value={announcements.length} />
            <StatBox label="Blog Posts" value={blogs.length} />
            <StatBox label="Opportunities" value={opportunities.length} />
            <StatBox label="Doubts" value={doubts.length} />
            <StatBox label="Gallery Items" value={gallery.length} />
            <StatBox label="Resources" value={resources.length} />
          </section>
        )}

        {tab === "users" && (
          <section className="mt-6 space-y-4">
            <p className="text-sm text-white/55">{users.length} total users</p>
            {users.map((user) => (
              <div
                key={user._id}
                className={`${shellCard} flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-white">{user.name}</p>
                    {user.isSuspended && (
                      <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-rose-200">
                        Suspended
                      </span>
                    )}
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/55">
                      {user.role}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/55">
                    {user.email} · Batch {user.batch}
                  </p>
                  {user.suspendedReason && <p className="mt-2 text-sm text-rose-200">Reason: {user.suspendedReason}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSuspendModal({ user, reason: user.suspendedReason || "" })}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
                      user.isSuspended
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    }`}
                  >
                    {user.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                  {user._id !== adminUser?._id && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "projects" && (
          <section className="mt-6 space-y-6">
            <Section title="Add Project" description="Create, review, or remove public project entries.">
              <div className="grid gap-3">
                <input className={fieldClass} placeholder="Title *" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                <textarea className={fieldClass} placeholder="Description" rows={3} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                <input className={fieldClass} placeholder="Tech Stack (comma separated)" value={newProject.techStack} onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={fieldClass} placeholder="GitHub URL" value={newProject.githubUrl} onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })} />
                  <input className={fieldClass} placeholder="Demo URL" value={newProject.demoUrl} onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })} />
                </div>
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={newProject.featured} onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })} className="h-4 w-4 accent-cyan-300" />
                  Featured
                </label>
                <button onClick={createProject} className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  Add Project
                </button>
              </div>
            </Section>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project._id} className={`${shellCard} flex items-center justify-between gap-4 p-5`}>
                  <div>
                    <p className="text-base font-semibold text-white">{project.title}</p>
                    <p className="mt-1 text-sm text-white/55">{project.techStack?.join(", ")}</p>
                  </div>
                  <button onClick={() => handleDeleteProject(project._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "events" && (
          <section className="mt-6 space-y-6">
            <Section title="Add Event" description="Post new events and keep past entries visible.">
              <div className="grid gap-3">
                <input className={fieldClass} placeholder="Title *" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <div className="grid gap-3 md:grid-cols-2">
                  <select className={fieldClass} value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                    {["workshop", "hackathon", "contest", "seminar", "other"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select className={fieldClass} value={newEvent.status} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <textarea className={fieldClass} placeholder="Description" rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={fieldClass} type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                  <input className={fieldClass} placeholder="Venue" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} />
                </div>
                <button onClick={createEvent} className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  Add Event
                </button>
              </div>
            </Section>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className={`${shellCard} flex items-center justify-between gap-4 p-5`}>
                  <div>
                    <p className="text-base font-semibold text-white">{event.title}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {event.type} · {event.status} · {new Date(event.date).toDateString()}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteEvent(event._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "announcements" && (
          <section className="mt-6 space-y-6">
            <Section title="Add Announcement" description="Pin important updates for the community.">
              <div className="grid gap-3">
                <input className={fieldClass} placeholder="Title *" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
                <textarea className={fieldClass} placeholder="Body" rows={3} value={newAnnouncement.body} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })} />
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={newAnnouncement.important} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, important: e.target.checked })} className="h-4 w-4 accent-cyan-300" />
                  Mark as important
                </label>
                <button onClick={createAnnouncement} className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  Post
                </button>
              </div>
            </Section>
            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item._id} className={`${shellCard} flex items-center justify-between gap-4 p-5`}>
                  <div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-white/55">{item.body}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(item._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "timeline" && (
          <section className="mt-6 space-y-6">
            <Section title="Add Milestone" description="Build the public legacy timeline.">
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={fieldClass} placeholder="Year *" type="number" value={newTimeline.year} onChange={(e) => setNewTimeline({ ...newTimeline, year: e.target.value })} />
                  <input className={fieldClass} placeholder="Month" value={newTimeline.month} onChange={(e) => setNewTimeline({ ...newTimeline, month: e.target.value })} />
                </div>
                <input className={fieldClass} placeholder="Title *" value={newTimeline.title} onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })} />
                <textarea className={fieldClass} placeholder="Description" rows={3} value={newTimeline.description} onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })} />
                <button onClick={createTimeline} className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  Add Milestone
                </button>
              </div>
            </Section>
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={item._id} className={`${shellCard} flex items-center justify-between gap-4 p-5`}>
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-white/45">
                      {item.month} {item.year}
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-white/55">{item.description}</p>
                  </div>
                  <button onClick={() => handleDeleteTimeline(item._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "gallery" && (
          <section className="mt-6 space-y-6">
            <Section title="Add Photo" description="Upload or link gallery content.">
              <div className="grid gap-3">
                <input className={fieldClass} placeholder="Title *" value={newGallery.title} onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })} />
                <input className={fieldClass} placeholder="Image URL *" value={newGallery.imageUrl} onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })} />
                <div className="grid gap-3 md:grid-cols-2">
                  <select className={fieldClass} value={newGallery.category} onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}>
                    {["event", "poster", "team", "other"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <input className={fieldClass} placeholder="Event Reference (optional)" value={newGallery.eventRef} onChange={(e) => setNewGallery({ ...newGallery, eventRef: e.target.value })} />
                </div>
                <button onClick={createGalleryItem} className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  Add Photo
                </button>
              </div>
            </Section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gallery.map((item) => (
                <div key={item._id} className={`${shellCard} overflow-hidden`}>
                  <img src={item.imageUrl} alt={item.title} className="h-40 w-full object-cover" />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <button onClick={() => handleDeleteGallery(item._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "doubts" && (
          <section className="mt-6 space-y-4">
            <p className="text-sm text-white/55">{doubts.length} total questions · Admin can delete any post</p>
            {doubts.map((item) => (
              <div
                key={item._id}
                className={`${shellCard} flex items-start justify-between gap-4 p-5 ${
                  item.resolved ? "border-emerald-400/20" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {item.resolved && (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-emerald-200">
                        Resolved
                      </span>
                    )}
                    {item.domain && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/55">
                        {item.domain}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/55">
                    By {item.author?.name} · {item.replies?.length} replies · {item.upvotes?.length} upvotes
                  </p>
                </div>
                <button onClick={() => handleDeleteDoubt(item._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                  Delete
                </button>
              </div>
            ))}
          </section>
        )}

        {tab === "blogs" && (
          <section className="mt-6 space-y-4">
            <p className="text-sm text-white/55">{blogs.length} total posts · Admin can delete any post</p>
            {blogs.map((item) => (
                <div key={item._id} className={`${shellCard} flex items-start justify-between gap-4 p-5`}>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/55">
                    By {item.author?.name} · {new Date(item.createdAt).toDateString()}
                  </p>
                  {item.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/55">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => handleDeleteBlog(item._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                  Delete
                </button>
              </div>
            ))}
          </section>
        )}

        {tab === "opportunities" && (
          <section className="mt-6 space-y-6">
            <Section title="Add Opportunity" description="Publish and moderate opportunities with a cleaner editor.">
              <div className="grid gap-3">
                <input className={fieldClass} placeholder="Title *" value={newOpportunity.title} onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })} />
                <input className={fieldClass} placeholder="Company *" value={newOpportunity.company} onChange={(e) => setNewOpportunity({ ...newOpportunity, company: e.target.value })} />
                <div className="grid gap-3 md:grid-cols-2">
                  <select className={fieldClass} value={newOpportunity.type} onChange={(e) => setNewOpportunity({ ...newOpportunity, type: e.target.value })}>
                    {["internship", "job", "freelance", "open_source"].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <input className={fieldClass} placeholder="Domain" value={newOpportunity.domain} onChange={(e) => setNewOpportunity({ ...newOpportunity, domain: e.target.value })} />
                </div>
                <input className={fieldClass} placeholder="Apply Link *" value={newOpportunity.applyLink} onChange={(e) => setNewOpportunity({ ...newOpportunity, applyLink: e.target.value })} />
                <input className={fieldClass} type="date" value={newOpportunity.deadline} onChange={(e) => setNewOpportunity({ ...newOpportunity, deadline: e.target.value })} />
                <textarea className={fieldClass} placeholder="Description" rows={3} value={newOpportunity.description} onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })} />
                <button onClick={createOpportunityHandler} className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  Add Opportunity
                </button>
              </div>
            </Section>
            <div className="space-y-4">
              <p className="text-sm text-white/55">{opportunities.length} active opportunities · Admin can edit/delete any post</p>
              {opportunities.map((item) => (
                <div key={item._id} className={`${shellCard} p-5`}>
                  {editingOpportunity?._id === item._id ? (
                    <div className="grid gap-3">
                      <input className={fieldClass} value={editingOpportunity.title || ""} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, title: e.target.value })} />
                      <input className={fieldClass} value={editingOpportunity.company || ""} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, company: e.target.value })} />
                      <input className={fieldClass} value={editingOpportunity.domain || ""} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, domain: e.target.value })} />
                      <input className={fieldClass} value={editingOpportunity.applyLink || ""} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, applyLink: e.target.value })} />
                      <textarea className={fieldClass} rows={3} value={editingOpportunity.description || ""} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, description: e.target.value })} />
                      <div className="flex flex-wrap gap-2">
                        <button onClick={saveOpportunityUpdate} className="rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-black transition hover:bg-cyan-100">
                          Save
                        </button>
                        <button onClick={() => setEditingOpportunity(null)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-sm text-white/55">
                          {item.company} · {item.type} · Posted by {item.postedBy?.name}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                  <button onClick={() => setEditingOpportunity(item)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteOpportunity(item._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "team" && (
          <section className="mt-6 space-y-6">
            <Section title="Add Team Member" description="Manage founders, faculty, core teams, and yearly groups.">
              <div className="grid gap-3 md:grid-cols-2">
                <input className={fieldClass} placeholder="Name *" value={newTeamMember.name} onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })} />
                <input className={fieldClass} placeholder="Role (e.g. Co-Founder) *" value={newTeamMember.role} onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })} />
                <input className={fieldClass} placeholder="Subtitle / Department / Batch note" value={newTeamMember.subtitle} onChange={(e) => setNewTeamMember({ ...newTeamMember, subtitle: e.target.value })} />
                <input className={fieldClass} placeholder="Team Year (e.g. 2025)" type="number" value={newTeamMember.teamYear} onChange={(e) => setNewTeamMember({ ...newTeamMember, teamYear: e.target.value })} />
                <select className={fieldClass} value={newTeamMember.category} onChange={(e) => setNewTeamMember({ ...newTeamMember, category: e.target.value })}>
                  {["founder", "faculty", "core", "mentor"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <input className={fieldClass} placeholder="Batch Year" type="number" value={newTeamMember.batch} onChange={(e) => setNewTeamMember({ ...newTeamMember, batch: e.target.value })} />
                <input className={fieldClass} placeholder="Domains (comma separated)" value={newTeamMember.domain} onChange={(e) => setNewTeamMember({ ...newTeamMember, domain: e.target.value })} />
                <input className={fieldClass} placeholder="Display Order (0 = first)" type="number" value={newTeamMember.order} onChange={(e) => setNewTeamMember({ ...newTeamMember, order: e.target.value })} />
                <input className={fieldClass} placeholder="Image URL" value={newTeamMember.imageUrl} onChange={(e) => setNewTeamMember({ ...newTeamMember, imageUrl: e.target.value })} />
                <input className={fieldClass} type="file" accept="image/*" onChange={(e) => setNewTeamImageFile(e.target.files?.[0] || null)} />
                <input className={fieldClass} placeholder="LinkedIn URL" value={newTeamMember.linkedin} onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })} />
                <input className={fieldClass} placeholder="GitHub URL" value={newTeamMember.github} onChange={(e) => setNewTeamMember({ ...newTeamMember, github: e.target.value })} />
              </div>
              <button onClick={createTeamMemberHandler} className="mt-4 w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                Add Member
              </button>
            </Section>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member._id} className={`${shellCard} flex items-center justify-between gap-4 p-5`}>
                  <div>
                    <p className="text-base font-semibold text-white">{member.name}</p>
                    <p className="mt-1 text-sm text-white/55 capitalize">
                      {member.category} · {member.role}
                      {member.subtitle ? ` · ${member.subtitle}` : ""}
                      {member.teamYear ? ` · Team ${member.teamYear}` : ""}
                      {member.batch ? ` · Batch ${member.batch}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditingTeamMember({
                          ...member,
                          domain: Array.isArray(member.domain) ? member.domain.join(", ") : member.domain || "",
                          batch: member.batch || "",
                        });
                        setEditingTeamImageFile(null);
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTeamMember(member._id)} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-200 transition hover:bg-rose-400/20">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "contact" && (
          <section className="mt-6">
            <Section title="Edit Contact Info" description="Keep public contact channels current.">
              <div className="grid gap-4 max-w-2xl">
                {[
                  { key: "email", label: "Email", placeholder: "codewizards@dypatil.edu" },
                  { key: "location", label: "Location", placeholder: "University name and address" },
                  { key: "department", label: "Department", placeholder: "Department of CSE" },
                  { key: "github", label: "GitHub URL", placeholder: "https://github.com/..." },
                  { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/..." },
                  { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
                  { key: "twitter", label: "Twitter/X URL", placeholder: "https://twitter.com/..." },
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.28em] text-white/45">{item.label}</label>
                    <input
                      className={fieldClass}
                      placeholder={item.placeholder}
                      value={contactInfo[item.key] || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, [item.key]: e.target.value })}
                    />
                  </div>
                ))}
                <button onClick={saveContact} className="w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  Save Changes
                </button>
              </div>
            </Section>
          </section>
        )}

        {tab === "points" && (
          <section className="mt-6 space-y-4">
            <p className="text-sm text-white/55">Changes apply immediately and retroactively to all past activity.</p>
            {pointRules.map((rule) => (
              <div key={rule._id} className={`${shellCard} p-5`}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-base font-semibold text-white">{rule.label}</p>
                  {editingRule?._id !== rule._id && (
                    <button onClick={() => setEditingRule(JSON.parse(JSON.stringify(rule)))} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                      Edit
                    </button>
                  )}
                </div>
                {editingRule?._id === rule._id ? (
                  <div className="space-y-4">
                    {rule.type === "flat" ? (
                      <div className="flex items-center gap-3">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/45">Points</label>
                        <input
                          type="number"
                          value={editingRule.flatPoints}
                          onChange={(e) => setEditingRule({ ...editingRule, flatPoints: Number(e.target.value) })}
                          className="w-24 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/60"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editingRule.tiers.map((tier, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <span className="w-24 shrink-0 text-white/55">{tier.label}</span>
                            <span className="text-xs text-white/35">
                              {tier.min}–{tier.max ?? "∞"}
                            </span>
                            <input
                              type="number"
                              value={tier.points}
                              onChange={(e) => {
                                const newTiers = [...editingRule.tiers];
                                newTiers[idx] = { ...tier, points: Number(e.target.value) };
                                setEditingRule({ ...editingRule, tiers: newTiers });
                              }}
                              className="ml-auto w-24 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/60"
                            />
                            <span className="text-xs text-white/35">pts</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => saveRule(editingRule)} className="rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-black transition hover:bg-cyan-100">
                        Save
                      </button>
                      <button onClick={() => setEditingRule(null)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/55">
                    {rule.type === "flat"
                      ? `${rule.flatPoints} points`
                      : rule.tiers.map((tier) => `${tier.label}: ${tier.points}pts`).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>

      {editingTeamMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className={`${shellCard} w-full max-w-2xl p-6 md:p-7`}>
            <h2 className="text-2xl font-semibold text-white">Edit Team Member</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Name" value={editingTeamMember.name || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })} />
              <input className={fieldClass} placeholder="Role" value={editingTeamMember.role || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, role: e.target.value })} />
              <input className={fieldClass} placeholder="Subtitle / Department / Batch note" value={editingTeamMember.subtitle || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, subtitle: e.target.value })} />
              <input className={fieldClass} placeholder="Team Year" type="number" value={editingTeamMember.teamYear || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, teamYear: e.target.value })} />
              <select className={fieldClass} value={editingTeamMember.category || "core"} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, category: e.target.value })}>
                {["founder", "faculty", "core", "mentor"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <input className={fieldClass} placeholder="Batch" type="number" value={editingTeamMember.batch || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, batch: e.target.value })} />
              <input className={fieldClass} placeholder="Domains comma separated" value={editingTeamMember.domain || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, domain: e.target.value })} />
              <input className={fieldClass} placeholder="Image URL" value={editingTeamMember.imageUrl || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, imageUrl: e.target.value })} />
              <input className={fieldClass} type="file" accept="image/*" onChange={(e) => setEditingTeamImageFile(e.target.files?.[0] || null)} />
              <input className={fieldClass} placeholder="LinkedIn URL" value={editingTeamMember.linkedin || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, linkedin: e.target.value })} />
              <input className={fieldClass} placeholder="GitHub URL" value={editingTeamMember.github || ""} onChange={(e) => setEditingTeamMember({ ...editingTeamMember, github: e.target.value })} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={saveTeamMemberUpdate} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                Save
              </button>
              <button onClick={() => setEditingTeamMember(null)} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className={`${shellCard} w-full max-w-md p-6 md:p-7`}>
            <h2 className="text-2xl font-semibold text-white">
              {suspendModal.user.isSuspended ? "Unsuspend" : "Suspend"} {suspendModal.user.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              {suspendModal.user.isSuspended
                ? "This will restore the user's access immediately."
                : "The user will be blocked from all protected actions until unsuspended."}
            </p>
            {!suspendModal.user.isSuspended && (
              <textarea
                rows={3}
                placeholder="Reason for suspension (optional)"
                value={suspendModal.reason}
                onChange={(e) => setSuspendModal({ ...suspendModal, reason: e.target.value })}
                className={`${fieldClass} mt-4 resize-none`}
              />
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleSuspend}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  suspendModal.user.isSuspended
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "bg-rose-500 text-white hover:bg-rose-400"
                }`}
              >
                {suspendModal.user.isSuspended ? "Restore Access" : "Confirm Suspend"}
              </button>
              <button onClick={() => setSuspendModal(null)} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
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
