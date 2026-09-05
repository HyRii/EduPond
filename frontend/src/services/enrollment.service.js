import apiRequest from "./api";

export const enrollCourse = async (courseId) => {
  return apiRequest(`/courses/${courseId}/enroll`, {
    method: "POST",
  });
};

export const getMyEnrollments = async () => {
  return apiRequest("/me/enrollments");
};

export const getEnrollmentById = async (enrollmentId) => {
  return apiRequest(`/enrollments/${enrollmentId}`);
};