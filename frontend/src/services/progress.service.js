import apiRequest from "./api";

export const completeLesson = async (
  lessonId,
  enrollmentId
) => {

  return apiRequest(
    `/lessons/${lessonId}/complete`,
    {
      method: "POST",

      body: JSON.stringify({
        enrollmentId,
      }),
    }
  );
};