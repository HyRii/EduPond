import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getQuiz,
  submitQuizAttempt,
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

        const response =
          await getQuiz(
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

        const response =
          await submitQuizAttempt(
            quiz.id,
            enrollmentId,
            answers
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