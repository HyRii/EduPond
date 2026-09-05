import apiRequest from "./api";

export const getSectionsByCourseId = async (
  courseId
) => {
  return apiRequest(
    `/courses/${courseId}/sections`
  );
};

export const createSection = async (
  courseId,
  sectionData
) => {
  return apiRequest(
    `/courses/${courseId}/sections`,
    {
      method: "POST",
      body: JSON.stringify(
        sectionData
      ),
    }
  );
};

export const updateSection = async (
  sectionId,
  sectionData
) => {
  return apiRequest(
    `/sections/${sectionId}`,
    {
      method: "PUT",
      body: JSON.stringify(
        sectionData
      ),
    }
  );
};

export const deleteSection = async (
  sectionId
) => {
  return apiRequest(
    `/sections/${sectionId}`,
    {
      method: "DELETE",
    }
  );
};