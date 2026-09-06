import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

// EDITED (Phase 3C fix): this file used to import { getQuiz,
// submitQuizAttempt } from quiz.service.js, but that service module has
// never exported functions with those names -- it exports getQuizById and
// submitAttempt (see frontend/src/services/quiz.service.js). Calling this
// page would throw "getQuiz is not a function" the moment it tried to load.
// Fixed by importing the names that actually exist and renaming the local
// usages below to match.
import {
  getQuizById,
  submitAttempt as submitQuizAttemptRequest,
} from "../../services/quiz.service";

const QuizAttempt = () => {

  const {
    quizId,
    enrollmentId,
  } = useParams();

  const navigate =
    useNavigate();

  const [quiz, setQuiz] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {

    const loadQuiz = async () => {

      try {

        setLoading(true);
        setError("");

        // EDITED (Phase 3C fix): was getQuiz(quizId) (undefined function).
        const response =
          await getQuizById(
            quizId
          );

        setQuiz(
          response?.data?.quiz
        );

      } catch (error) {

        setError(
          error.message ||
          "Failed to load quiz."
        );

      } finally {

        setLoading(false);

      }

    };

    loadQuiz();

  }, [quizId]);

  const handleAnswerChange =
    (
      questionId,
      optionId
    ) => {

      setAnswers(
        (current) => ({
          ...current,
          [questionId]:
            optionId,
        })
      );

    };

  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();

      if (!quiz) {
        return;
      }

      try {

        setSubmitting(true);
        setError("");

        // EDITED (Phase 3C fix): `answers` is kept in local state as a
        // { [questionId]: optionId } map (convenient for the radio inputs
        // below), but the backend's POST /quizzes/:id/attempts endpoint
        // expects an array of { questionId, optionId } pairs (see
        // backend/src/controllers/quiz.controller.js -> submitAttempt and
        // backend/src/services/quiz.service.js -> submitAttempt, which
        // builds its answerMap by reading answer.questionId /
        // answer.optionId off each array item). Previously the raw object
        // was sent as-is, which the backend would just read as an empty
        // answer set. Convert to the array shape here before sending.
        const answersPayload = Object.entries(
          answers
        ).map(
          ([questionId, optionId]) => ({
            questionId: Number(questionId),
            optionId: Number(optionId),
          })
        );

        const response =
          await submitQuizAttemptRequest(
            quiz.id,
            enrollmentId,
            answersPayload
          );

        setResult(
          response
            ?.data
            ?.attempt
        );

      } catch (error) {

        setError(
          error.message ||
          "Failed to submit quiz."
        );

      } finally {

        setSubmitting(false);

      }

    };

  if (loading) {
    return (
      <section className="student-page">
        <div className="student-state">
          Loading quiz...
        </div>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="student-page">
        <div className="student-error">
          {error ||
            "Quiz not found."}
        </div>
      </section>
    );
  }

  if (result) {

    return (
      <section className="student-page">

        <div className="student-page-header">

          <div>

            <p className="page-eyebrow">
              QUIZ RESULT
            </p>

            <h1>
              {quiz.title}
            </h1>

          </div>

        </div>

        <div className="quiz-result-card">

          <strong>
            {result.score}%
          </strong>

          <p>
            Passing score:{" "}
            {result.passing_score}%
          </p>

          {result.passed ? (

            <div className="student-success">

              <h2>
                Quiz Passed
              </h2>

              <p>
                Congratulations! You passed this quiz.
              </p>

              <p>
                Your course certificate eligibility
                has been checked.
              </p>

            </div>

          ) : (

            <div className="student-error">

              <h2>
                Quiz Not Passed
              </h2>

              <p>
                You need at least{" "}
                {result.passing_score}%
                to pass.
              </p>

            </div>

          )}

          <div className="form-actions">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/student/my-courses/${enrollmentId}`
                )
              }
            >
              Back to Course
            </button>

          </div>

        </div>

      </section>
    );

  }

  return (
    <section className="student-page">

      <div className="student-page-header">

        <div>

          <p className="page-eyebrow">
            QUIZ
          </p>

          <h1>
            {quiz.title}
          </h1>

          <p className="page-description">
            {quiz.description}
          </p>

          <p>
            Passing score:{" "}
            {quiz.passing_score}%
          </p>

        </div>

      </div>

      {error && (
        <div className="student-error">
          {error}
        </div>
      )}

      <form
        className="quiz-attempt-form"
        onSubmit={handleSubmit}
      >

        {quiz.questions.map(
          (
            question,
            questionIndex
          ) => (

            <article
              key={
                question.id
              }
              className="quiz-question-card"
            >

              <h2>
                {questionIndex + 1}.{" "}
                {
                  question.question_text
                }
              </h2>

              <p>
                {question.points} point(s)
              </p>

              <div className="quiz-options">

                {question.options.map(
                  (option) => (

                    <label
                      key={
                        option.id
                      }
                      className="quiz-option"
                    >

                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={
                          option.id
                        }
                        checked={
                          Number(
                            answers[
                              question.id
                            ]
                          ) ===
                          Number(
                            option.id
                          )
                        }
                        onChange={() =>
                          handleAnswerChange(
                            question.id,
                            option.id
                          )
                        }
                      />

                      <span>
                        {
                          option.option_text
                        }
                      </span>

                    </label>

                  )
                )}

              </div>

            </article>

          )
        )}

        <div className="form-actions">

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Quiz"}
          </button>

        </div>

      </form>

    </section>
  );
};

export default QuizAttempt;