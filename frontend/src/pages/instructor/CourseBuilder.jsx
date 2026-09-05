import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

  const [course, setCourse] =
    useState(null);

  const [sections, setSections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showSectionForm, setShowSectionForm] =
    useState(false);

  const [editingSectionId, setEditingSectionId] =
    useState(null);

  const [addingLessonSectionId, setAddingLessonSectionId] =
    useState(null);

  const [editingLessonId, setEditingLessonId] =
    useState(null);

  const loadBuilder = async () => {

    try {

      setLoading(true);
      setError("");

      const courseResponse =
        await getCourseById(id);

      const courseData =
        courseResponse?.data?.course;

      if (!courseData) {
        throw new Error(
          "Course not found."
        );
      }

      const sectionsResponse =
        await getSectionsByCourseId(id);

      const rawSections =
        sectionsResponse?.data?.sections ||
        [];

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
                  lessonResponse?.data
                    ?.lessons || [],
              };

            }
          )
        );

      setCourse(courseData);
      setSections(
        sectionsWithLessons
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to load course builder."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadBuilder();

  }, [id]);

  const refresh = async () => {

    await loadBuilder();

    setShowSectionForm(false);
    setEditingSectionId(null);
    setAddingLessonSectionId(null);
    setEditingLessonId(null);

  };

  const handleCreateSection = async (
    data
  ) => {

    try {

      await createSection(
        id,
        data
      );

      await refresh();

    } catch (error) {

      setError(
        error.message ||
        "Failed to create section."
      );

    }

  };

  const handleUpdateSection = async (
    sectionId,
    data
  ) => {

    try {

      await updateSection(
        sectionId,
        data
      );

      await refresh();

    } catch (error) {

      setError(
        error.message ||
        "Failed to update section."
      );

    }

  };

  const handleDeleteSection = async (
    sectionId
  ) => {

    const confirmed =
      window.confirm(
        "Delete this section and its lessons?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteSection(
        sectionId
      );

      await refresh();

    } catch (error) {

      setError(
        error.message ||
        "Failed to delete section."
      );

    }

  };

  const handleCreateLesson = async (
    sectionId,
    data
  ) => {

    try {

      await createLesson(
        sectionId,
        data
      );

      await refresh();

    } catch (error) {

      setError(
        error.message ||
        "Failed to create lesson."
      );

    }

  };

  const handleUpdateLesson = async (
    lessonId,
    data
  ) => {

    try {

      await updateLesson(
        lessonId,
        data
      );

      await refresh();

    } catch (error) {

      setError(
        error.message ||
        "Failed to update lesson."
      );

    }

  };

  const handleDeleteLesson = async (
    lessonId
  ) => {

    const confirmed =
      window.confirm(
        "Delete this lesson?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteLesson(
        lessonId
      );

      await refresh();

    } catch (error) {

      setError(
        error.message ||
        "Failed to delete lesson."
      );

    }

  };

  if (loading) {

    return (
      <div className="instructor-loading">
        Loading course builder...
      </div>
    );

  }

  if (!course) {

    return (
      <div className="instructor-error">
        {error || "Course not found."}
      </div>
    );

  }

  return (
    <section className="instructor-page">

      <div className="instructor-page-header">

        <div>

          <p className="page-eyebrow">
            COURSE BUILDER
          </p>

          <h1>
            {course.title}
          </h1>

          <p className="page-description">
            Build the Section → Lesson structure of this course.
          </p>

        </div>

        <Link
          to={`/instructor/courses/${id}/edit`}
        >
          Back to Course
        </Link>

      </div>

      {error && (
        <div className="instructor-error">
          {error}
        </div>
      )}

      <div className="builder-toolbar">

        <button
          type="button"
          onClick={() =>
            setShowSectionForm(true)
          }
        >
          Add Section
        </button>

      </div>

      {showSectionForm && (

        <div className="builder-form-card">

          <h2>
            New Section
          </h2>

          <SectionForm
            onSave={
              handleCreateSection
            }
            onCancel={() =>
              setShowSectionForm(
                false
              )
            }
          />

        </div>

      )}

      {sections.length === 0 ? (

        <div className="builder-empty">
          No sections yet. Add your first section.
        </div>

      ) : (

        <div className="builder-sections">

          {sections.map(
            (section) => (

              <article
                key={section.id}
                className="builder-section"
              >

                <div className="builder-section-header">

                  <div>

                    <span className="builder-order">
                      Section {section.sort_order}
                    </span>

                    <h2>
                      {section.title}
                    </h2>

                    <p>
                      {section.description ||
                        "No description."}
                    </p>

                  </div>

                  <div className="builder-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setEditingSectionId(
                          editingSectionId ===
                            section.id
                            ? null
                            : section.id
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteSection(
                          section.id
                        )
                      }
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAddingLessonSectionId(
                          section.id
                        )
                      }
                    >
                      Add Lesson
                    </button>

                  </div>

                </div>

                {editingSectionId ===
                  section.id && (

                  <div className="builder-form-card">

                    <SectionForm
                      section={section}
                      onSave={(
                        data
                      ) =>
                        handleUpdateSection(
                          section.id,
                          data
                        )
                      }
                      onCancel={() =>
                        setEditingSectionId(
                          null
                        )
                      }
                    />

                  </div>

                )}

                {addingLessonSectionId ===
                  section.id && (

                  <div className="builder-form-card">

                    <h3>
                      New Lesson
                    </h3>

                    <LessonForm
                      onSave={(
                        data
                      ) =>
                        handleCreateLesson(
                          section.id,
                          data
                        )
                      }
                      onCancel={() =>
                        setAddingLessonSectionId(
                          null
                        )
                      }
                    />

                  </div>

                )}

                <div className="builder-lessons">

                  {section.lessons.length === 0 ? (

                    <p className="builder-empty">
                      No lessons in this section yet.
                    </p>

                  ) : (

                    section.lessons.map(
                      (lesson) => (

                        <div
                          key={lesson.id}
                          className="builder-lesson"
                        >

                          <div>

                            <span className="builder-order">
                              Lesson{" "}
                              {lesson.sort_order}
                            </span>

                            <h3>
                              {lesson.title}
                            </h3>

                            <div className="lesson-meta">

                              <span>
                                {lesson.content_type}
                              </span>

                              <span>
                                {lesson.is_required
                                  ? "Required"
                                  : "Optional"}
                              </span>

                              {lesson.duration_minutes !=
                                null && (
                                <span>
                                  {
                                    lesson.duration_minutes
                                  }{" "}
                                  min
                                </span>
                              )}

                            </div>

                          </div>

                          <div className="builder-actions">

                            <button
                              type="button"
                              onClick={() =>
                                setEditingLessonId(
                                  editingLessonId ===
                                    lesson.id
                                    ? null
                                    : lesson.id
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteLesson(
                                  lesson.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                          {editingLessonId ===
                            lesson.id && (

                            <div className="builder-form-card full-width">

                              <LessonForm
                                lesson={lesson}
                                onSave={(
                                  data
                                ) =>
                                  handleUpdateLesson(
                                    lesson.id,
                                    data
                                  )
                                }
                                onCancel={() =>
                                  setEditingLessonId(
                                    null
                                  )
                                }
                              />

                            </div>

                          )}

                        </div>

                      )
                    )

                  )}

                </div>

              </article>

            )
          )}

        </div>

      )}

    </section>
  );
};

export default CourseBuilder;