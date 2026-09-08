// NEW FILE (Phase 5): Dashboard API client, mirrors the three backend endpoints.
import apiRequest from "./api";

export const getAdminDashboard = async () => apiRequest("/dashboard/admin");

export const getInstructorDashboard = async () =>
  apiRequest("/dashboard/instructor");

export const getStudentDashboard = async () =>
  apiRequest("/dashboard/student");
