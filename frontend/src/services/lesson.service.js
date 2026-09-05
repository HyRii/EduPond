import apiRequest from "./api";

export const getLessonsBySectionId =
  async (sectionId) => {
    return apiRequest(
      `/sections/${sectionId}/lessons`
    );
  };

export const createLesson = async (
  sectionId,
  lessonData
) => {
  return apiRequest(
    `/sections/${sectionId}/lessons`,
    {
      method: "POST",
      body: JSON.stringify(
        lessonData
      ),
    }
  );
};

export const updateLesson = async (
  lessonId,
  lessonData
) => {
  return apiRequest(
    `/lessons/${lessonId}`,
    {
      method: "PUT",
      body: JSON.stringify(
        lessonData
      ),
    }
  );
};

export const deleteLesson = async (
  lessonId
) => {
  return apiRequest(
    `/lessons/${lessonId}`,
    {
      method: "DELETE",
    }
  );
};