import apiRequest from "./api";

export const createProposal = async (data) =>
  apiRequest("/course-proposals", { method: "POST", body: JSON.stringify(data) });

export const updateProposal = async (id, data) =>
  apiRequest(`/course-proposals/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const addProposalSection = async (id, data) =>
  apiRequest(`/course-proposals/${id}/sections`, {
    method: "POST", body: JSON.stringify(data),
  });

export const addProposalLesson = async (proposalId, sectionId, data) =>
  apiRequest(`/course-proposals/${proposalId}/sections/${sectionId}/lessons`, {
    method: "POST", body: JSON.stringify(data),
  });

export const getMyProposalDetail = async (id) => apiRequest(`/course-proposals/${id}`);

export const submitProposal = async (id) =>
  apiRequest(`/course-proposals/${id}/submit`, { method: "POST" });

export const getMyProposals = async () =>
  apiRequest("/course-proposals/mine");

export const listProposals = async (status = "") =>
  apiRequest(`/admin/course-proposals${status ? `?status=${status}` : ""}`);

export const getProposalDetail = async (id) =>
  apiRequest(`/admin/course-proposals/${id}`);

export const reviewProposal = async (id, status, adminNote = "") =>
  apiRequest(`/admin/course-proposals/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote }),
  });

export const convertProposal = async (id) =>
  apiRequest(`/admin/course-proposals/${id}/convert`, { method: "POST" });
