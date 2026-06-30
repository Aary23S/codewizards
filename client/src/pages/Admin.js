import { useEffect, useMemo, useState } from "react";
import {
  api,
  createAnnouncement,
  createEvent,
  createUser,
  createProject,
  deleteAnnouncement,
  deleteEvent,
  deleteProject,
  deleteUser,
  getAnnouncements,
  getEvents,
  getProjects,
  getResources,
  getUsers,
  updateAnnouncement,
  updateEvent,
  updateProject,
  updateUser,
  getPointRules,
  updatePointRule 
} from "../services/api";

const StatBox = ({ label, value }) => (
  <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 text-center">
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-gray-500 text-xs mt-1">{label}</p>
  </div>
);

const blankProject = { title: "", description: "", techStack: "", githubUrl: "", demoUrl: "", featured: false };
const blankEvent = { title: "", type: "workshop", description: "", date: "", venue: "", status: "upcoming", featured: false, registrationLink: "" };
const blankAnnouncement = { title: "", body: "", important: false };
const blankResource = { title: "", url: "", category: "Other", domain: "", description: "" };

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const Admin = () => {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ users: 0, projects: 0, events: 0, announcements: 0, resources: 0 });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");

  const [projectForm, setProjectForm] = useState(blankProject);
  const [projectId, setProjectId] = useState(null);
  const [eventForm, setEventForm] = useState(blankEvent);
  const [eventId, setEventId] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState(blankAnnouncement);
  const [announcementId, setAnnouncementId] = useState(null);
  const [newResource, setNewResource] = useState(blankResource);

  const [pointRules, setPointRules] = useState([]);
  const [editingRule, setEditingRule] = useState(null); // rule being edited, or null

  const [userDrafts, setUserDrafts] = useState({});
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    batch: "",
    domain: "",
    bio: "",
    isMentor: false,
  });

  const inputClass =
    "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400 w-full";

  const loadData = async () => {
    const [u, p, e, a, r] = await Promise.all([
      getUsers(),
      getProjects(),
      getEvents(),
      getAnnouncements(),
      getResources(),
    ]);

    setUsers(u.data.data);
    setProjects(p.data.data);
    setEvents(e.data.data);
    setAnnouncements(a.data.data);
    setResources(r.data.data);

    setStats({
      users: u.data.data.length,
      projects: p.data.data.length,
      events: e.data.data.length,
      announcements: a.data.data.length,
      resources: r.data.data.length,
    });

    setUserDrafts(
      Object.fromEntries(
        u.data.data.map((user) => [
          user._id,
          {
            name: user.name || "",
            email: user.email || "",
            role: user.role || "student",
            batch: user.batch ?? "",
            isMentor: !!user.isMentor,
            domain: Array.isArray(user.domain) ? user.domain.join(", ") : "",
            bio: user.bio || "",
          },
        ])
      )
    );
  };

  useEffect(() => {
  Promise.all([getUsers(), getProjects(), getEvents(), getAnnouncements(), getResources(), getPointRules()]).then(
    ([u, p, e, a, r, pr]) => {
      setUsers(u.data.data);
      setProjects(p.data.data);
      setEvents(e.data.data);
      setAnnouncements(a.data.data);
      setResources(r.data.data);
      setPointRules(pr.data.data);
      setStats({ users: u.data.data.length, projects: p.data.data.length, events: e.data.data.length });
    }
  );
}, []);

const saveRule = async (rule) => {
  const res = await updatePointRule(rule._id, {
    flatPoints: rule.flatPoints,
    tiers: rule.tiers,
  });
  setPointRules((prev) => prev.map((r) => (r._id === rule._id ? res.data.data : r)));
  setEditingRule(null);
};

  const tabs = useMemo(() => ["overview", "users", "projects", "events", "announcements", "resources", "points"], []);

  const handleUserDraft = (id, patch) => {
    setUserDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveUser = async (id) => {
    setError("");
    try {
      const draft = userDrafts[id];
      await updateUser(id, {
        name: draft.name,
        email: draft.email,
        role: draft.role,
        batch: draft.batch === "" ? null : Number(draft.batch),
        isMentor: draft.isMentor,
        domain: draft.domain.split(",").map((d) => d.trim()).filter(Boolean),
        bio: draft.bio,
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  const createAdminUser = async () => {
    setError("");
    try {
      await createUser({
        ...newUser,
        batch: newUser.batch === "" ? null : Number(newUser.batch),
        domain: newUser.domain.split(",").map((d) => d.trim()).filter(Boolean),
      });
      setNewUser({ name: "", email: "", password: "", role: "student", batch: "", domain: "", bio: "", isMentor: false });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  const saveProject = async () => {
    setError("");
    try {
      const payload = {
        ...projectForm,
        techStack: projectForm.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = projectId ? await updateProject(projectId, payload) : await createProject(payload);
      setProjects((prev) => (projectId ? prev.map((item) => (item._id === projectId ? res.data.data : item)) : [res.data.data, ...prev]));
      setProjectForm(blankProject);
      setProjectId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project");
    }
  };

  const editProject = (project) => {
    setProjectId(project._id);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      techStack: Array.isArray(project.techStack) ? project.techStack.join(", ") : "",
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
      featured: !!project.featured,
    });
  };

  const saveEvent = async () => {
    setError("");
    try {
      const res = eventId ? await updateEvent(eventId, eventForm) : await createEvent(eventForm);
      setEvents((prev) => (eventId ? prev.map((item) => (item._id === eventId ? res.data.data : item)) : [res.data.data, ...prev]));
      setEventForm(blankEvent);
      setEventId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event");
    }
  };

  const editEvent = (event) => {
    setEventId(event._id);
    setEventForm({
      title: event.title || "",
      type: event.type || "workshop",
      description: event.description || "",
      date: toDateInput(event.date),
      venue: event.venue || "",
      status: event.status || "upcoming",
      featured: !!event.featured,
      registrationLink: event.registrationLink || "",
    });
  };

  const saveAnnouncement = async () => {
    setError("");
    try {
      const res = announcementId
        ? await updateAnnouncement(announcementId, announcementForm)
        : await createAnnouncement(announcementForm);

      setAnnouncements((prev) =>
        announcementId ? prev.map((item) => (item._id === announcementId ? res.data.data : item)) : [res.data.data, ...prev]
      );

      setAnnouncementForm(blankAnnouncement);
      setAnnouncementId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save announcement");
    }
  };

  const createResource = async () => {
    setError("");
    try {
      const res = await api.post("/resources", newResource);
      setResources((prev) => [res.data.data, ...prev]);
      setNewResource(blankResource);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create resource");
    }
  };

  const deleteResource = async (id) => {
    setError("");
    try {
      await api.delete(`/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resource");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Admin</p>
      <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Manage users, projects, events, announcements, and resources.</p>

      {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

      <div className="flex gap-2 flex-wrap mb-10">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-4 py-2 rounded-full border capitalize transition-colors ${
              tab === t ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatBox label="Total Users" value={stats.users} />
          <StatBox label="Projects" value={stats.projects} />
          <StatBox label="Events" value={stats.events} />
          <StatBox label="Announcements" value={stats.announcements} />
          <StatBox label="Resources" value={stats.resources} />
        </div>
      )}

      {tab === "users" && (
        <div className="flex flex-col gap-4">
          <div className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Add User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              <input className={inputClass} placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <input className={inputClass} type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              <select className={inputClass} value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                {["student", "senior", "alumni", "admin"].map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <input className={inputClass} type="number" placeholder="Batch" value={newUser.batch} onChange={(e) => setNewUser({ ...newUser, batch: e.target.value })} />
              <input className={inputClass} placeholder="Domains comma separated" value={newUser.domain} onChange={(e) => setNewUser({ ...newUser, domain: e.target.value })} />
              <textarea className={inputClass} rows={2} placeholder="Bio" value={newUser.bio} onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={newUser.isMentor} onChange={(e) => setNewUser({ ...newUser, isMentor: e.target.checked })} className="accent-white" />
              Mentor
            </label>
            <button onClick={createAdminUser} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">
              Create User
            </button>
          </div>

          {users.map((user) => {
            const draft = userDrafts[user._id] || {};
            return (
              <div key={user._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                  <button onClick={() => deleteUser(user._id).then(loadData)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className={inputClass} value={draft.name || ""} onChange={(e) => handleUserDraft(user._id, { name: e.target.value })} />
                  <input className={inputClass} value={draft.email || ""} onChange={(e) => handleUserDraft(user._id, { email: e.target.value })} />
                  <select className={inputClass} value={draft.role || "student"} onChange={(e) => handleUserDraft(user._id, { role: e.target.value })}>
                    {["student", "senior", "alumni", "admin"].map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <input className={inputClass} type="number" value={draft.batch ?? ""} onChange={(e) => handleUserDraft(user._id, { batch: e.target.value })} placeholder="Batch" />
                  <textarea className={inputClass} rows={2} value={draft.domain || ""} onChange={(e) => handleUserDraft(user._id, { domain: e.target.value })} placeholder="Domains comma separated" />
                  <textarea className={inputClass} rows={2} value={draft.bio || ""} onChange={(e) => handleUserDraft(user._id, { bio: e.target.value })} placeholder="Bio" />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={!!draft.isMentor} onChange={(e) => handleUserDraft(user._id, { isMentor: e.target.checked })} className="accent-white" />
                  Mentor
                </label>

                <button onClick={() => saveUser(user._id)} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">
                  Save User
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "projects" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">{projectId ? "Edit Project" : "Add Project"}</h2>
            <input className={inputClass} placeholder="Title" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} />
            <textarea className={inputClass} placeholder="Description" rows={2} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
            <input className={inputClass} placeholder="Tech Stack (comma separated)" value={projectForm.techStack} onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })} />
            <input className={inputClass} placeholder="GitHub URL" value={projectForm.githubUrl} onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })} />
            <input className={inputClass} placeholder="Demo URL" value={projectForm.demoUrl} onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} className="accent-white" />
              Featured
            </label>
            <div className="flex gap-3">
              <button onClick={saveProject} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">
                {projectId ? "Update Project" : "Add Project"}
              </button>
              {projectId && (
                <button type="button" onClick={() => { setProjectId(null); setProjectForm(blankProject); }} className="border border-gray-700 text-gray-400 hover:border-white hover:text-white px-5 py-2 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {projects.map((project) => (
              <div key={project._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{project.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{project.techStack?.join(", ")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => editProject(project)} className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-3 py-1 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => deleteProject(project._id).then(loadData)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "events" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">{eventId ? "Edit Event" : "Add Event"}</h2>
            <input className={inputClass} placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <select className={inputClass} value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}>
              {["workshop", "hackathon", "contest", "seminar", "other"].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <textarea className={inputClass} placeholder="Description" rows={2} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
            <input className={inputClass} type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
            <input className={inputClass} placeholder="Venue" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} />
            <input className={inputClass} placeholder="Registration Link" value={eventForm.registrationLink} onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })} />
            <select className={inputClass} value={eventForm.status} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={eventForm.featured} onChange={(e) => setEventForm({ ...eventForm, featured: e.target.checked })} className="accent-white" />
              Featured
            </label>
            <div className="flex gap-3">
              <button onClick={saveEvent} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">
                {eventId ? "Update Event" : "Add Event"}
              </button>
              {eventId && (
                <button type="button" onClick={() => { setEventId(null); setEventForm(blankEvent); }} className="border border-gray-700 text-gray-400 hover:border-white hover:text-white px-5 py-2 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div key={event._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{event.title}</p>
                  <p className="text-gray-500 text-xs">{event.type} · {event.status} · {new Date(event.date).toDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => editEvent(event)} className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-3 py-1 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => deleteEvent(event._id).then(loadData)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "announcements" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">{announcementId ? "Edit Announcement" : "Add Announcement"}</h2>
            <input className={inputClass} placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
            <textarea className={inputClass} placeholder="Body" rows={2} value={announcementForm.body} onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={announcementForm.important} onChange={(e) => setAnnouncementForm({ ...announcementForm, important: e.target.checked })} className="accent-white" />
              Mark as Important
            </label>
            <div className="flex gap-3">
              <button onClick={saveAnnouncement} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">
                {announcementId ? "Update Announcement" : "Post Announcement"}
              </button>
              {announcementId && (
                <button type="button" onClick={() => { setAnnouncementId(null); setAnnouncementForm(blankAnnouncement); }} className="border border-gray-700 text-gray-400 hover:border-white hover:text-white px-5 py-2 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{announcement.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{announcement.body}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setAnnouncementId(announcement._id); setAnnouncementForm({ title: announcement.title || "", body: announcement.body || "", important: !!announcement.important }); }} className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-3 py-1 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => deleteAnnouncement(announcement._id).then(loadData)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "resources" && (
        <div className="flex flex-col gap-6">
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Add Resource</h2>

            <input className={inputClass} placeholder="Title" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} />
            <input className={inputClass} placeholder="URL" value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} />

            <select className={inputClass} value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}>
              {["PDF", "GitHub", "YouTube", "Docs", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>

            <input className={inputClass} placeholder="Domain (e.g. Web, AI)" value={newResource.domain} onChange={(e) => setNewResource({ ...newResource, domain: e.target.value })} />
            <textarea className={inputClass} placeholder="Description" rows={2} value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} />

            <button onClick={createResource} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit">
              Add Resource
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {resources.map((r) => (
              <div key={r._id} className="border border-gray-800 rounded-xl p-4 bg-gray-900 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{r.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {r.category} {r.domain && `· ${r.domain}`}
                  </p>
                  {r.description && <p className="text-gray-600 text-xs mt-1">{r.description}</p>}
                </div>

                <button onClick={() => deleteResource(r._id)} className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1 rounded-lg transition-colors shrink-0">
                  Delete
                </button>
              </div>
            ))}

            {resources.length === 0 && <p className="text-gray-600 text-sm">No resources found.</p>}
          </div>
        </div>
      )}

      {/* Point Rules */}
{tab === "points" && (
  <div className="flex flex-col gap-4">
    <p className="text-gray-500 text-sm mb-2">
      Changes apply immediately and retroactively to all past activity (dynamic recompute).
    </p>
    {pointRules.map((rule) => (
      <div key={rule._id} className="border border-gray-800 rounded-xl p-5 bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium text-sm">{rule.label}</p>
          {editingRule?._id !== rule._id && (
            <button
              onClick={() => setEditingRule(JSON.parse(JSON.stringify(rule)))}
              className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-3 py-1 rounded-lg transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editingRule?._id === rule._id ? (
          <div className="flex flex-col gap-3">
            {rule.type === "flat" ? (
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-400">Points</label>
                <input
                  type="number"
                  value={editingRule.flatPoints}
                  onChange={(e) => setEditingRule({ ...editingRule, flatPoints: Number(e.target.value) })}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-gray-400"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {editingRule.tiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-24 shrink-0">{tier.label}</span>
                    <span className="text-gray-600 text-xs">
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
                      className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm w-20 ml-auto focus:outline-none focus:border-gray-400"
                    />
                    <span className="text-gray-600 text-xs">pts</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => saveRule(editingRule)}
                className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingRule(null)}
                className="border border-gray-700 text-gray-400 hover:border-white hover:text-white px-4 py-1.5 rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-xs">
            {rule.type === "flat"
              ? `${rule.flatPoints} points`
              : rule.tiers.map((t) => `${t.label}: ${t.points}pts`).join(" · ")}
          </p>
        )}
      </div>
    ))}
  </div>
)}
    </div>
  );
};

export default Admin;