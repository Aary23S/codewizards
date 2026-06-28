import axios from "axios";

const api = axios.create({
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

// --- Projects ---
export const getProjects = (params) => api.get("/projects", { params });
export const getProject = (id) => api.get(`/projects/${id}`);

// --- Events ---
export const getEvents = (params) => api.get("/events", { params });
export const getEvent = (id) => api.get(`/events/${id}`);

// --- Timeline ---
export const getTimeline = () => api.get("/timeline");

// --- Gallery ---
export const getGallery = (params) => api.get("/gallery", { params });

// --- Announcements ---
export const getAnnouncements = () => api.get("/announcements");