import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import SectionForm from "../../components/course/SectionForm";
import LessonForm from "../../components/course/LessonForm";

import {
  getCourseById,
} from "../../services/course.service";

import {
  getSectionsByCourseId,
  createSection,
  updateSection,
  deleteSection,
} from "../../services/section.service";

import {
  getLessonsBySectionId,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../services/lesson.service";

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);

  const [editingSection, setEditingSection] =
    useState(null);

  const [editingLesson, setEditingLesson] =
    useState(null);

  const [addingSection, setAddingSection] =
    useState(false);

  const [addingLessonFor, setAddingLessonFor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadBuilder = async () => {
    try {
      setLoading(true);
      setError("");

      const courseResponse =
        await getCourseById(id);

      const sectionsResponse =
        await getSectionsByCourseId(id);

      const courseData =
        courseResponse?.data?.course;

      const rawSections =
        sectionsResponse?.data?.sections || [];

      if (!courseData) {
        throw new Error(
          "Course not found."
        );
      }

      const sectionsWithLessons =
        await Promise.all(
          rawSections.map(
            async (section) => {
              const lessonResponse =
                await getLessonsBySectionId(
                  section.id
                );

              return {
                ...section,
                lessons:
                  lessonResponse?.data?.lessons ||
                  [],
              };
            }
          )
        );

      setCourse(courseData);
      setSections(sectionsWithLessons);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load course builder."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilder();
  }, [id]);

  const runAction = async (action) => {
    try {
      setError("");

      await action();

      setEditingSection(null);
      setEditingLesson(null);
      setAddingSection(false);
      setAddingLessonFor(null);

      await loadBuilder();
    } catch (err) {
      setError(
        err.message ||
          "Action failed."
      );
    }
  };

  const isLocked =
    course?.status === "PENDING_REVIEW" ||
    course?.status === "ARCHIVED";

  if (loading) {
    return (
      <section className="instructor-page">
        <div className="instructor-loading">
          Loading course builder...
        </div>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="instructor-page">
        <div className="instructor-error">
          {error || "Course not found."}
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
            COURSE BUILDER
          </p>

          <h1>{course.title}</h1>

          <p className="page-description">
            Build your course using sections,
            lessons, and lesson quizzes.
          </p>
        </div>

        <div className="instructor-actions">
          <Link
            to={`/instructor/courses/${id}/edit`}
          >
            Back to Course
          </Link>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="instructor-error">
          {error}
        </div>
      )}

      {/* =========================
          REVIEW NOTICE
      ========================= */}
      {course.status ===
        "PENDING_REVIEW" && (
        <div className="instructor-info">
          This course is currently waiting
          for admin review. Editing is
          temporarily disabled.
        </div>
      )}

      {course.status ===
        "PUBLISHED" && (
        <div className="instructor-info">
          This course is published. Any
          change to its sections or lessons
          will return the course to
          PENDING_REVIEW.
        </div>
      )}

      {/* =========================
          ADD SECTION
      ========================= */}
      <div
        className="builder-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <strong>
            {sections.length}
          </strong>{" "}
          {sections.length === 1
            ? "section"
            : "sections"}
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={() =>
              setAddingSection(true)
            }
          >
            + Add Section
          </button>
        )}
      </div>

      {/* =========================
          SECTION FORM
      ========================= */}
      {addingSection && (
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <SectionForm
            onSave={(data) =>
              runAction(() =>
                createSection(
                  id,
                  data
                )
              )
            }
            onCancel={() =>
              setAddingSection(false)
            }
          />
        </div>
      )}

      {/* =========================
          EMPTY
      ========================= */}
      {sections.length === 0 && (
        <div className="instructor-empty">
          <h2>No sections yet</h2>

          <p>
            Create your first section to
            start adding lessons.
          </p>

          {!isLocked && (
            <button
              type="button"
              onClick={() =>
                setAddingSection(true)
              }
            >
              Create First Section
            </button>
          )}
        </div>
      )}

      {/* =========================
          SECTIONS
      ========================= */}
      <div className="builder-list">
        {sections.map(
          (section) => (
            <article
              key={section.id}
              className="builder-section"
            >
              {/* SECTION HEADER */}
              <div
                className="builder-section-header"
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  marginBottom:
                    "1rem",
                }}
              >
                <div>
                  <p className="page-eyebrow">
                    SECTION{" "}
                    {section.sort_order}
                  </p>

                  <h2>
                    {section.title}
                  </h2>

                  {section.description && (
                    <p>
                      {section.description}
                    </p>
                  )}
                </div>

                {!isLocked && (
                  <div className="instructor-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSection(
                          section
                        )
                      }
                    >
                      Edit Section
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            "Delete this section and all lessons inside it?"
                          );

                        if (confirmed) {
                          runAction(() =>
                            deleteSection(
                              section.id
                            )
                          );
                        }
                      }}
                    >
                      Delete Section
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAddingLessonFor(
                          section.id
                        )
                      }
                    >
                      + Add Lesson
                    </button>
                  </div>
                )}
              </div>

              {/* EDIT SECTION */}
              {editingSection?.id ===
                section.id && (
                <div
                  style={{
                    marginBottom:
                      "1rem",
                  }}
                >
                  <SectionForm
                    section={section}
                    onSave={(data) =>
                      runAction(() =>
                        updateSection(
                          section.id,
                          data
                        )
                      )
                    }
                    onCancel={() =>
                      setEditingSection(
                        null
                      )
                    }
                  />
                </div>
              )}

              {/* ADD LESSON */}
              {addingLessonFor ===
                section.id && (
                <div
                  style={{
                    marginBottom:
                      "1rem",
                  }}
                >
                  <LessonForm
                    onSave={(data) =>
                      runAction(() =>
                        createLesson(
                          section.id,
                          data
                        )
                      )
                    }
                    onCancel={() =>
                      setAddingLessonFor(
                        null
                      )
                    }
                  />
                </div>
              )}

              {/* LESSON COUNT */}
              <div
                style={{
                  marginBottom:
                    "0.75rem",
                  fontSize:
                    "0.9rem",
                  opacity: 0.75,
                }}
              >
                {section.lessons.length}{" "}
                {section.lessons.length ===
                1
                  ? "lesson"
                  : "lessons"}
              </div>

              {/* LESSONS */}
              <div className="lesson-list">
                {section.lessons.map(
                  (lesson) => (
                    <article
                      key={lesson.id}
                      className="lesson-row"
                    >
                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div>
                          <span className="builder-order">
                            Lesson{" "}
                            {
                              lesson.sort_order
                            }
                          </span>

                          <h3>
                            {
                              lesson.title
                            }
                          </h3>
                        </div>

                        {lesson.description && (
                          <p>
                            {
                              lesson.description
                            }
                          </p>
                        )}

                        <div className="lesson-meta">
                          <span>
                            {
                              lesson.content_type
                            }
                          </span>

                          {lesson.duration_minutes !==
                            null &&
                            lesson.duration_minutes !==
                              undefined && (
                              <span>
                                {
                                  lesson.duration_minutes
                                }{" "}
                                min
                              </span>
                            )}

                          <span>
                            {lesson.is_required
                              ? "Required"
                              : "Optional"}
                          </span>
                        </div>
                      </div>

                      {/* LESSON ACTIONS */}
                      <div className="instructor-actions">
                        {!isLocked && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingLesson(
                                  lesson
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const confirmed =
                                  window.confirm(
                                    "Delete this lesson?"
                                  );

                                if (
                                  confirmed
                                ) {
                                  runAction(
                                    () =>
                                      deleteLesson(
                                        lesson.id
                                      )
                                  );
                                }
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {/* QUIZ */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/instructor/lessons/${lesson.id}/quiz`
                            )
                          }
                        >
                          Quiz
                        </button>
                      </div>

                      {/* EDIT LESSON */}
                      {editingLesson?.id ===
                        lesson.id && (
                        <div
                          className="full-width"
                          style={{
                            marginTop:
                              "1rem",
                            width: "100%",
                          }}
                        >
                          <LessonForm
                            lesson={lesson}
                            onSave={(data) =>
                              runAction(() =>
                                updateLesson(
                                  lesson.id,
                                  data
                                )
                              )
                            }
                            onCancel={() =>
                              setEditingLesson(
                                null
                              )
                            }
                          />
                        </div>
                      )}
                    </article>
                  )
                )}

                {section.lessons.length ===
                  0 && (
                  <div
                    className="instructor-empty"
                    style={{
                      padding:
                        "1rem",
                    }}
                  >
                    <p>
                      This section has
                      no lessons yet.
                    </p>

                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddingLessonFor(
                            section.id
                          )
                        }
                      >
                        + Add First Lesson
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
};

export default CourseBuilder;