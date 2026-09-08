import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getQuizById,
  getRetryStatus,
  submitAttempt as submitQuizAttemptRequest,
} from "../../services/quiz.service";

const formatRetryTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleString();
};

const QuizAttempt = () => {
  const { quizId, enrollmentId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [retryStatus, setRetryStatus] = useState(null);
  const [error, setError] = useState("");

  const loadRetryStatus = async () => {
    try {
      const response = await getRetryStatus(
        quizId,
        enrollmentId
      );
      setRetryStatus(response?.data?.retry || null);
    } catch (error) {
      setError(
        error.message ||
          "Failed to check quiz retry status."
      );
    }
  };

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getQuizById(quizId);
        setQuiz(response?.data?.quiz || null);
      } catch (error) {
        setError(
          error.message || "Failed to load quiz."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
    loadRetryStatus();
  }, [quizId, enrollmentId]);

  useEffect(() => {
    if (!retryStatus?.retry_available_at) return undefined;

    const timer = window.setInterval(() => {
      loadRetryStatus();
    }, 30000);

    return () => window.clearInterval(timer);
  }, [retryStatus?.retry_available_at]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!quiz || retryStatus?.cooldown_active) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const answersPayload = Object.entries(answers).map(
        ([questionId, optionId]) => ({
          questionId: Number(questionId),
          optionId: Number(optionId),
        })
      );

      const response = await submitQuizAttemptRequest(
        quiz.id,
        enrollmentId,
        answersPayload
      );

      const attempt = response?.data?.attempt;
      setResult(attempt || null);
      setRetryStatus(null);
    } catch (error) {
      if (error.status === 429) {
        const retryAvailableAt =
          error.data?.retryAvailableAt ||
          error.data?.errors?.retryAvailableAt ||
          null;

        setRetryStatus({
          can_attempt: false,
          cooldown_active: true,
          retry_available_at: retryAvailableAt,
          last_attempt: null,
        });
      }

      setError(
        error.message || "Failed to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="student-page">
        <div className="student-state">Loading quiz...</div>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="student-page">
        <div className="student-error">
          {error || "Quiz not found."}
        </div>
      </section>
    );
  }

  if (result) {
    const certificate = result.certificate;

    return (
      <section className="student-page">
        <div className="student-page-header">
          <div>
            <p className="page-eyebrow">QUIZ RESULT</p>
            <h1>{quiz.title}</h1>
          </div>
        </div>

        <div className="quiz-result-card">
          <strong>{result.score}%</strong>
          <p>Passing score: {result.passing_score}%</p>

          {result.passed ? (
            <div className="student-success">
              <h2>Quiz Passed</h2>
              <p>
                Congratulations! You passed this quiz.
              </p>
              {certificate?.certificate_url ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/student/certificates/${certificate.id}`
                    )
                  }
                >
                  View Certificate
                </button>
              ) : (
                <p>
                  Your course certificate eligibility has
                  been checked. If all course requirements are
                  complete, the certificate has been issued.
                </p>
              )}
            </div>
          ) : (
            <div className="student-error">
              <h2>Quiz Not Passed</h2>
              <p>
                You need at least {result.passing_score}% to
                pass.
              </p>
              <p>
                You can take the quiz again one hour after
                this failed attempt.
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

  const cooldownActive = retryStatus?.cooldown_active;

  return (
    <section className="student-page">
      <div className="student-page-header">
        <div>
          <p className="page-eyebrow">QUIZ</p>
          <h1>{quiz.title}</h1>
          <p className="page-description">
            {quiz.description}
          </p>
          <p>Passing score: {quiz.passing_score}%</p>
        </div>
      </div>

      {error && (
        <div className="student-error">{error}</div>
      )}

      {cooldownActive && (
        <div className="quiz-cooldown-card">
          <h2>Quiz temporarily locked</h2>
          <p>
            Your last attempt did not meet the passing
            score. You can retry one hour after that attempt.
          </p>
          {retryStatus.retry_available_at && (
            <p>
              Retry available at: {" "}
              <strong>
                {formatRetryTime(
                  retryStatus.retry_available_at
                )}
              </strong>
            </p>
          )}
        </div>
      )}

      <form
        className="quiz-attempt-form"
        onSubmit={handleSubmit}
      >
        {quiz.questions.map((question, questionIndex) => (
          <article
            key={question.id}
            className="quiz-question-card"
          >
            <h2>
              {questionIndex + 1}. {question.question_text}
            </h2>
            <p>{question.points} point(s)</p>

            <div className="quiz-options">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className="quiz-option"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    disabled={cooldownActive}
                    checked={
                      Number(answers[question.id]) ===
                      Number(option.id)
                    }
                    onChange={() =>
                      handleAnswerChange(
                        question.id,
                        option.id
                      )
                    }
                  />
                  <span>{option.option_text}</span>
                </label>
              ))}
            </div>
          </article>
        ))}

        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting || cooldownActive}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default QuizAttempt;
