import apiRequest from "./api";

export const getCourses = async () => {
  return apiRequest("/courses");
};

export const getCourseById = async (
  courseId
) => {
  return apiRequest(
    `/courses/${courseId}`
  );
};

export const createCourse = async (
  courseData
) => {
  return apiRequest("/courses", {
    method: "POST",
    body: JSON.stringify(courseData),
  });
};

export const updateCourse = async (
  courseId,
  courseData
) => {
  return apiRequest(
    `/courses/${courseId}`,
    {
      method: "PUT",
      body: JSON.stringify(courseData),
    }
  );
};

export const deleteCourse = async (
  courseId
) => {
  return apiRequest(
    `/courses/${courseId}`,
    {
      method: "DELETE",
    }
  );
};

export const submitCourse = async (
  courseId
) => {
  return apiRequest(
    `/courses/${courseId}/submit`,
    {
      method: "POST",
    }
  );
};

export const publishCourse = async (
  courseId
) => {
  return apiRequest(
    `/courses/${courseId}/publish`,
    {
      method: "POST",
    }
  );
};

export const rejectCourse = async (
  courseId
) => {
  return apiRequest(
    `/courses/${courseId}/reject`,
    {
      method: "POST",
    }
  );
};

export const archiveCourse = async (
  courseId
) => {
  return apiRequest(
    `/courses/${courseId}/archive`,
    {
      method: "POST",
    }
  );
};