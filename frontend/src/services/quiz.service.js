import apiRequest from "./api";

export const createQuiz = async (
  lessonId,
  quizData
) => {
  return apiRequest(
    `/lessons/${lessonId}/quiz`,
    {
      method: "POST",
      body: JSON.stringify(quizData),
    }
  );
};

export const getQuizByLessonId =
  async (lessonId) => {
    return apiRequest(
      `/lessons/${lessonId}/quiz`
    );
  };

export const getQuizById =
  async (quizId) => {
    return apiRequest(
      `/quizzes/${quizId}`
    );
  };

export const addQuestion = async (
  quizId,
  questionData
) => {
  return apiRequest(
    `/quizzes/${quizId}/questions`,
    {
      method: "POST",
      body: JSON.stringify(
        questionData
      ),
    }
  );
};

export const addOption = async (
  questionId,
  optionData
) => {
  return apiRequest(
    `/questions/${questionId}/options`,
    {
      method: "POST",
      body: JSON.stringify(
        optionData
      ),
    }
  );
};

export const submitAttempt = async (
  quizId,
  enrollmentId,
  answers
) => {
  return apiRequest(
    `/quizzes/${quizId}/attempts`,
    {
      method: "POST",
      body: JSON.stringify({
        enrollmentId,
        answers,
      }),
    }
  );
};

export const getQuizAttempts =
  async (quizId) => {
    return apiRequest(
      `/quizzes/${quizId}/attempts`
    );
  };

export const getRetryStatus = async (
  quizId,
  enrollmentId
) => {
  return apiRequest(
    `/quizzes/${quizId}/retry-status?enrollmentId=${enrollmentId}`
  );
};
