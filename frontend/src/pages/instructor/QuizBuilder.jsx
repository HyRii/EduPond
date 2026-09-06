import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getQuizByLessonId,
  createQuiz,
  addQuestion,
  addOption,
} from "../../services/quiz.service";

const createEmptyQuestion = () => ({
  questionText: "",
  options: [
    {
      text: "",
      isCorrect: true,
    },
    {
      text: "",
      isCorrect: false,
    },
    {
      text: "",
      isCorrect: false,
    },
    {
      text: "",
      isCorrect: false,
    },
  ],
});

const QuizBuilder = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] =
    useState(null);

  const [quizTitle, setQuizTitle] =
    useState("");

  const [quizDescription, setQuizDescription] =
    useState("");

  const [passingScore, setPassingScore] =
    useState(70);

  const [newQuestion, setNewQuestion] =
    useState(createEmptyQuestion());

  const [loading, setLoading] =
    useState(true);

  const [savingQuiz, setSavingQuiz] =
    useState(false);

  const [savingQuestion, setSavingQuestion] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getQuizByLessonId(
          lessonId
        );

      const quizData =
        response?.data?.quiz;

      if (!quizData) {
        setQuiz(null);
        return;
      }

      setQuiz(quizData);

      setQuizTitle(
        quizData.title || ""
      );

      setQuizDescription(
        quizData.description || ""
      );

      setPassingScore(
        quizData.passing_score ?? 70
      );
    } catch (err) {
      /*
       * 404 berarti lesson belum memiliki quiz.
       * Itu bukan error bagi halaman ini.
       */
      if (
        err?.status === 404 ||
        err?.statusCode === 404 ||
        String(
          err?.message || ""
        ).toLowerCase().includes(
          "quiz not found"
        )
      ) {
        setQuiz(null);
      } else {
        setError(
          err.message ||
            "Failed to load quiz."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const handleCreateQuiz = async (
    event
  ) => {
    event.preventDefault();

    if (!quizTitle.trim()) {
      setError(
        "Quiz title is required."
      );
      return;
    }

    try {
      setSavingQuiz(true);
      setError("");

      const response =
        await createQuiz(
          lessonId,
          {
            title:
              quizTitle.trim(),

            description:
              quizDescription.trim(),

            passingScore:
              Number(passingScore),
          }
        );

      const createdQuiz =
        response?.data?.quiz;

      setQuiz(
        createdQuiz || null
      );

      await loadQuiz();
    } catch (err) {
      setError(
        err.message ||
          "Failed to create quiz."
      );
    } finally {
      setSavingQuiz(false);
    }
  };

  const updateOption = (
    optionIndex,
    field,
    value
  ) => {
    setNewQuestion(
      (current) => ({
        ...current,

        options:
          current.options.map(
            (option, index) => {
              if (
                index !==
                optionIndex
              ) {
                return option;
              }

              return {
                ...option,
                [field]:
                  value,
              };
            }
          ),
      })
    );
  };

  const setCorrectOption = (
    optionIndex
  ) => {
    setNewQuestion(
      (current) => ({
        ...current,

        options:
          current.options.map(
            (option, index) => ({
              ...option,
              isCorrect:
                index ===
                optionIndex,
            })
          ),
      })
    );
  };

  const addOptionField = () => {
    setNewQuestion(
      (current) => ({
        ...current,

        options: [
          ...current.options,
          {
            text: "",
            isCorrect: false,
          },
        ],
      })
    );
  };

  const removeOptionField = (
    optionIndex
  ) => {
    if (
      newQuestion.options.length <=
      2
    ) {
      return;
    }

    setNewQuestion(
      (current) => {
        const removedOption =
          current.options[
            optionIndex
          ];

        const nextOptions =
          current.options.filter(
            (_, index) =>
              index !==
              optionIndex
          );

        /*
         * Jika option yang dihapus adalah
         * jawaban benar, jadikan option
         * pertama sebagai jawaban benar.
         */
        if (
          removedOption?.isCorrect &&
          nextOptions.length > 0
        ) {
          return {
            ...current,
            options:
              nextOptions.map(
                (
                  option,
                  index
                ) => ({
                  ...option,
                  isCorrect:
                    index ===
                    0,
                })
              ),
          };
        }

        return {
          ...current,
          options:
            nextOptions,
        };
      }
    );
  };

  const resetQuestionForm = () => {
    setNewQuestion(
      createEmptyQuestion()
    );
  };

  const handleAddQuestion = async (
    event
  ) => {
    event.preventDefault();

    if (!quiz) {
      return;
    }

    if (
      !newQuestion.questionText.trim()
    ) {
      setError(
        "Question text is required."
      );
      return;
    }

    const validOptions =
      newQuestion.options.filter(
        (option) =>
          option.text.trim()
      );

    if (
      validOptions.length < 2
    ) {
      setError(
        "A question must have at least 2 options."
      );
      return;
    }

    const correctOptions =
      validOptions.filter(
        (option) =>
          option.isCorrect
      );

    if (
      correctOptions.length !==
      1
    ) {
      setError(
        "Select exactly one correct answer."
      );
      return;
    }

    try {
      setSavingQuestion(true);
      setError("");

      const questionResponse =
        await addQuestion(
          quiz.id,
          {
            questionText:
              newQuestion.questionText.trim(),

            questionType:
              "SINGLE_CHOICE",
          }
        );

      const createdQuestion =
        questionResponse?.data
          ?.question;

      if (!createdQuestion) {
        throw new Error(
          "Question was not created."
        );
      }

      for (
        const option
        of validOptions
      ) {
        await addOption(
          createdQuestion.id,
          {
            optionText:
              option.text.trim(),

            isCorrect:
              Boolean(
                option.isCorrect
              ),
          }
        );
      }

      resetQuestionForm();

      await loadQuiz();
    } catch (err) {
      setError(
        err.message ||
          "Failed to add question."
      );
    } finally {
      setSavingQuestion(false);
    }
  };

  if (loading) {
    return (
      <section className="instructor-page">
        <div className="instructor-loading">
          Loading quiz...
        </div>
      </section>
    );
  }

  return (
    <section className="instructor-page">
      {/* =========================
          HEADER
      ========================= */}
      <div className="instructor-page-header">
        <div>
          <p className="page-eyebrow">
            QUIZ BUILDER
          </p>

          <h1>Lesson Quiz</h1>

          <p className="page-description">
            Create questions and
            multiple-choice answers
            for this lesson.
          </p>
        </div>

        <Link
          to={`/instructor/courses/${quiz?.course_id || ""}/builder`}
          onClick={(event) => {
            /*
             * quiz baru belum tentu memiliki
             * course_id pada response.
             *
             * Gunakan browser history sebagai
             * fallback agar selalu kembali ke
             * Course Builder.
             */
            if (!quiz?.course_id) {
              event.preventDefault();
              navigate(-1);
            }
          }}
        >
          ← Back
        </Link>
      </div>

      {error && (
        <div className="instructor-error">
          {error}
        </div>
      )}

      {/* =========================
          CREATE QUIZ
      ========================= */}
      {!quiz && (
        <form
          onSubmit={
            handleCreateQuiz
          }
          style={{
            maxWidth:
              "760px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "1rem",
            }}
          >
            <label>
              <strong>
                Quiz Title
              </strong>

              <input
                type="text"
                value={quizTitle}
                onChange={(event) =>
                  setQuizTitle(
                    event.target
                      .value
                  )
                }
                placeholder="Example: JavaScript Basics Quiz"
                required
                style={{
                  width:
                    "100%",
                  marginTop:
                    "0.4rem",
                }}
              />
            </label>

            <label>
              <strong>
                Description
              </strong>

              <textarea
                value={
                  quizDescription
                }
                onChange={(event) =>
                  setQuizDescription(
                    event.target
                      .value
                  )
                }
                placeholder="Explain what this quiz tests."
                rows={5}
                style={{
                  width:
                    "100%",
                  marginTop:
                    "0.4rem",
                }}
              />
            </label>

            <label>
              <strong>
                Passing Score
              </strong>

              <input
                type="number"
                min="0"
                max="100"
                value={
                  passingScore
                }
                onChange={(event) =>
                  setPassingScore(
                    event.target
                      .value
                  )
                }
                required
                style={{
                  width:
                    "160px",
                  marginTop:
                    "0.4rem",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={
                savingQuiz
              }
            >
              {savingQuiz
                ? "Creating Quiz..."
                : "Create Quiz"}
            </button>
          </div>
        </form>
      )}

      {/* =========================
          QUIZ EDITOR
      ========================= */}
      {quiz && (
        <div
          style={{
            maxWidth:
              "900px",
          }}
        >
          <div
            style={{
              marginBottom:
                "2rem",
            }}
          >
            <h2>
              {quiz.title}
            </h2>

            {quiz.description && (
              <p>
                {quiz.description}
              </p>
            )}

            <p>
              Passing Score:{" "}
              <strong>
                {quiz.passing_score}%
              </strong>
            </p>
          </div>

          {/* =========================
              EXISTING QUESTIONS
          ========================= */}
          <div
            style={{
              marginBottom:
                "2rem",
            }}
          >
            <h2>
              Questions
            </h2>

            {!quiz.questions ||
              quiz.questions.length ===
                0 ? (
              <div
                className="instructor-empty"
                style={{
                  marginTop:
                    "1rem",
                }}
              >
                <p>
                  No questions yet.
                  Add your first
                  question below.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap:
                    "1rem",
                }}
              >
                {quiz.questions.map(
                  (
                    question,
                    index
                  ) => (
                    <article
                      key={
                        question.id
                      }
                      style={{
                        padding:
                          "1.25rem",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "8px",
                      }}
                    >
                      <h3>
                        {index +
                          1}
                        .{" "}
                        {
                          question.question_text
                        }
                      </h3>

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap:
                            "0.5rem",
                        }}
                      >
                        {(
                          question.options ||
                          []
                        ).map(
                          (
                            option
                          ) => (
                            <div
                              key={
                                option.id
                              }
                              style={{
                                padding:
                                  "0.5rem",
                                border:
                                  "1px solid #eee",
                                borderRadius:
                                  "6px",
                              }}
                            >
                              {option.option_text}

                              {option.is_correct && (
                                <strong>
                                  {" "}
                                  ✓ Correct
                                </strong>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </div>

          {/* =========================
              NEW QUESTION
          ========================= */}
          <form
            onSubmit={
              handleAddQuestion
            }
          >
            <h2>
              Add Question
            </h2>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap:
                  "1rem",
                marginTop:
                  "1rem",
              }}
            >
              <label>
                <strong>
                  Question
                </strong>

                <textarea
                  value={
                    newQuestion.questionText
                  }
                  onChange={(event) =>
                    setNewQuestion(
                      (
                        current
                      ) => ({
                        ...current,
                        questionText:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Write your question here..."
                  rows={4}
                  required
                  style={{
                    width:
                      "100%",
                    marginTop:
                      "0.4rem",
                  }}
                />
              </label>

              <div>
                <h3>
                  Answer Options
                </h3>

                <p>
                  Select exactly one
                  correct answer.
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "0.75rem",
                  }}
                >
                  {newQuestion.options.map(
                    (
                      option,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "0.75rem",
                        }}
                      >
                        <input
                          type="radio"
                          name="correctOption"
                          checked={
                            option.isCorrect
                          }
                          onChange={() =>
                            setCorrectOption(
                              index
                            )
                          }
                        />

                        <input
                          type="text"
                          value={
                            option.text
                          }
                          onChange={(
                            event
                          ) =>
                            updateOption(
                              index,
                              "text",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder={`Answer option ${index + 1}`}
                          style={{
                            flex:
                              1,
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeOptionField(
                              index
                            )
                          }
                          disabled={
                            newQuestion
                              .options
                              .length <=
                            2
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    addOptionField
                  }
                  style={{
                    marginTop:
                      "0.75rem",
                  }}
                >
                  + Add Option
                </button>
              </div>

              <button
                type="submit"
                disabled={
                  savingQuestion
                }
              >
                {savingQuestion
                  ? "Saving Question..."
                  : "Add Question"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default QuizBuilder;