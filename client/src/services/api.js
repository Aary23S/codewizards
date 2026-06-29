import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Auth ---
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");
export const getMyRegistrations = () => api.get("/events/my-registrations");

// --- Projects ---
export const getProjects = (params) => api.get("/projects", { params });
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post("/projects", data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// --- Events ---
export const getEvents = (params) => api.get("/events", { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post("/events", data);
export const updateEvent = (id, data) => api.patch(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const registerForEvent = (eventId) => api.post(`/events/${eventId}/register`);

// --- Timeline ---
export const getTimeline = () => api.get("/timeline");

// --- Gallery ---
export const getGallery = (params) => api.get("/gallery", { params });

// --- Announcements ---
export const getAnnouncements = () => api.get("/announcements");
export const createAnnouncement = (data) => api.post("/announcements", data);
export const updateAnnouncement = (id, data) => api.patch(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

// --- Users ---
export const getUsers = (params) => api.get("/users", { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// --- Mentorship ---
export const createMentorshipRequest = (data) => api.post("/mentorship/request", data);
export const getMyMentorshipRequests = () => api.get("/mentorship/my-requests");
export const updateMentorshipStatus = (id, status) =>
  api.patch(`/mentorship/${id}/status`, { status });

// --- Resources ---
export const getResources = (params) => api.get("/resources", { params });


export const getOpportunities = (params) => api.get("/opportunities", { params });
export const createOpportunity = (data) => api.post("/opportunities", data);
export const deleteOpportunity = (id) => api.delete(`/opportunities/${id}`);

export default api;