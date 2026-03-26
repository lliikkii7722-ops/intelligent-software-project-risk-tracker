import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://intelligent-software-project-risk-tracker.onrender.com"
});

// ================= AUTH =================
export const registerUser = (userData) =>
  API.post("/api/auth/register", userData);

export const loginUser = (userData) =>
  API.post("/api/auth/login", userData);

// ================= USERS =================
export const getUsers = () => API.get("/api/users");

export const deleteUser = (id) =>
  API.delete(`/api/users/${id}`);

// ================= PROJECTS =================
export const getProjects = () => API.get("/api/projects");

export const createProject = (projectData) =>
  API.post("/api/projects", projectData);

export const updateProject = (id, projectData) =>
  API.put(`/api/projects/${id}`, projectData);

export const deleteProject = (id) =>
  API.delete(`/api/projects/${id}`);

export const updateProjectProgress = (id, data) =>
  API.put(`/api/projects/${id}/progress`, data);

export const getProjectAnalytics = (id) =>
  API.get(`/api/projects/${id}/analytics`);

// ================= RISKS =================
export const getRisks = () => API.get("/api/risks");

export const createRisk = (riskData) =>
  API.post("/api/risks", riskData);

export const updateRisk = (id, riskData) =>
  API.put(`/api/risks/${id}`, riskData);

export const deleteRisk = (id) =>
  API.delete(`/api/risks/${id}`);

export const getRiskAnalytics = (id) =>
  API.get(`/api/risks/${id}/analytics`);

// ================= MITIGATIONS =================
export const getMitigations = () =>
  API.get("/api/mitigations");

export const getMitigationsByRiskId = (riskId) =>
  API.get(`/api/mitigations/risk/${riskId}`);

export const createMitigation = (data) =>
  API.post("/api/mitigations", data);

export const updateMitigation = (id, data) =>
  API.put(`/api/mitigations/${id}`, data);

export const updateMitigationStatus = (id, status) =>
  API.patch(`/api/mitigations/${id}/status`, { status });

export const deleteMitigation = (id) =>
  API.delete(`/api/mitigations/${id}`);

// ================= NOTIFICATIONS =================
export const getNotifications = () =>
  API.get("/api/notifications");

// ================= AUDIT LOGS =================
export const getAuditLogs = () =>
  API.get("/api/audit");

export default API;