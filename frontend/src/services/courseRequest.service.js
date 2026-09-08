import apiRequest from "./api";

export const createRequest = async (data) =>
  apiRequest("/course-requests", { method: "POST", body: JSON.stringify(data) });

export const getMyRequests = async () =>
  apiRequest("/course-requests/mine");

export const getAvailableRequests = async () => apiRequest("/course-requests/available");

export const listRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  const query = params.toString();
  return apiRequest(`/admin/course-requests${query ? `?${query}` : ""}`);
};

export const getDemand = async () =>
  apiRequest("/admin/course-requests/demand");

export const reviewRequest = async (id, status, adminNote = "") =>
  apiRequest(`/admin/course-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote }),
  });
