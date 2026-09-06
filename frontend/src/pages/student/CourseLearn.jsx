import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getEnrollmentById,
} from "../../services/enrollment.service";

import {
  getSectionsByCourseId,
} from "../../services/section.service";

import {
  getLessonsBySectionId,
} from "../../services/lesson.service";

import {
  completeLesson,
} from "../../services/progress.service";

const CourseLearn = () => {

  const {
    enrollmentId,
  } = useParams();

  const navigate =
    useNavigate();

  const [enrollment, setEnrollment] =
    useState(null);

  const [sections, setSections] =
    useState([]);

  const [completedLessons, setCompletedLessons] =
    useState(new Set());

  const [loading, setLoading] =
    useState(true);

  const [completingLessonId, setCompletingLessonId] =
    useState(null);

  const [error, setError] =
    useState("");

  /*
   * Lesson yang sedang dibuka.
   * Hanya satu lesson yang dibuka pada satu waktu.
   */
  const [openLessonId, setOpenLessonId] =
    useState(null);

  /*
   * Lesson yang sudah discroll sampai bottom.
   * Lesson yang masuk Set ini baru boleh
   * menampilkan tombol "Mark as Done".
   */
  const [lessonReady, setLessonReady] =
    useState(new Set());

  const loadCourse = async () => {

    try {

      setLoading(true);
      setError("");

      const enrollmentResponse =
        await getEnrollmentById(
          enrollmentId
        );

      const enrollmentData =
        enrollmentResponse
          ?.data
          ?.enrollment;

      if (!enrollmentData) {

        throw new Error(
          "Enrollment not found."
        );

      }

      const sectionsResponse =
        await getSectionsByCourseId(
          enrollmentData.course_id
        );

      const rawSections =
        sectionsResponse
          ?.data
          ?.sections || [];

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
                  lessonResponse
                    ?.data
                    ?.lessons || [],
              };

            }
          )
        );

      const progressIds =
        (
          enrollmentData.lesson_progress ||
          []
        )
          .filter(
            (item) =>
              item.status ===
              "COMPLETED"
          )
          .map(
            (item) =>
              Number(
                item.lesson_id
              )
          );

      setEnrollment(
        enrollmentData
      );

      setSections(
        sectionsWithLessons
      );

      setCompletedLessons(
        new Set(progressIds)
      );

      /*
       * Lesson yang sudah completed tidak perlu
       * melewati scroll requirement lagi.
       */
      setLessonReady(
        new Set(progressIds)
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to load course."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadCourse();

  }, [enrollmentId]);

  /*
   * Membuka / menutup lesson.
   */
  const handleOpenLesson = (
    lessonId
  ) => {

    const numericLessonId =
      Number(lessonId);

    /*
     * Kalau lesson yang sama diklik,
     * tutup lesson.
     */
    if (
      openLessonId ===
      numericLessonId
    ) {

      setOpenLessonId(null);

      return;
    }

    /*
     * Buka lesson baru.
     */
    setOpenLessonId(
      numericLessonId
    );

  };

  /*
   * Dipanggil setiap kali student scroll
   * di dalam area lesson.
   */
  const handleLessonScroll = (
    event,
    lessonId
  ) => {

    const element =
      event.currentTarget;

    /*
     * Toleransi 10px supaya perbedaan
     * pembulatan browser tidak membuat
     * tombol tidak pernah aktif.
     */
    const reachedBottom =
      element.scrollTop +
        element.clientHeight >=
      element.scrollHeight - 10;

    if (!reachedBottom) {
      return;
    }

    setLessonReady(
      (current) => {

        const next =
          new Set(current);

        next.add(
          Number(lessonId)
        );

        return next;
      }
    );

  };

  const handleComplete = async (
    lessonId
  ) => {

    const numericLessonId =
      Number(lessonId);

    /*
     * Safety check:
     * lesson harus sudah selesai dibaca /
     * discroll sampai bottom.
     */
    if (
      !lessonReady.has(
        numericLessonId
      )
    ) {
      setError(
        "Please open and scroll to the bottom of the lesson first."
      );

      return;
    }

    /*
     * Jangan kirim request kalau lesson
     * sudah completed atau request lain
     * masih berjalan.
     */
    if (
      completingLessonId ||
      completedLessons.has(
        numericLessonId
      )
    ) {

      return;

    }

    try {

      setCompletingLessonId(
        numericLessonId
      );

      setError("");

      await completeLesson(
        numericLessonId,
        enrollmentId
      );

      /*
       * Update completed state.
       */
      setCompletedLessons(
        (current) => {

          const next =
            new Set(current);

          next.add(
            numericLessonId
          );

          return next;

        }
      );

      /*
       * Reload enrollment data supaya
       * progress_percentage,
       * completed_required,
       * enrollment.status
       * tetap sinkron dengan backend.
       */
      const enrollmentResponse =
        await getEnrollmentById(
          enrollmentId
        );

      const updatedEnrollment =
        enrollmentResponse
          ?.data
          ?.enrollment;

      if (updatedEnrollment) {

        setEnrollment(
          updatedEnrollment
        );

      }

    } catch (error) {

      setError(
        error.message ||
        "Failed to complete lesson."
      );

    } finally {

      setCompletingLessonId(
        null
      );

    }

  };

  if (loading) {

    return (
      <section className="student-page">

        <div className="student-state">
          Loading course...
        </div>

      </section>
    );

  }

  if (!enrollment) {

    return (
      <section className="student-page">

        <div className="student-error">
          {error ||
            "Enrollment not found."}
        </div>

      </section>
    );

  }

  const progress =
    Number(
      enrollment
        .progress_percentage || 0
    );

  return (
    <section className="student-page">

      <div className="student-page-header">

        <div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate(
                "/student/my-courses"
              )
            }
          >
            ← My Courses
          </button>

          <p className="page-eyebrow">
            LEARNING
          </p>

          <h1>
            {enrollment.title}
          </h1>

          <p className="page-description">
            {enrollment.description ||
              "Continue your learning journey."}
          </p>

        </div>

      </div>

      {error && (
        <div className="student-error">
          {error}
        </div>
      )}

      <div className="learning-progress-card">

        <div className="learning-progress-header">

          <div>

            <span>
              Course Progress
            </span>

            <strong>
              {progress}%
            </strong>

          </div>

          <span>
            {
              enrollment.completed_required ||
              0
            }{" "}
            /{" "}
            {
              enrollment.total_required ||
              0
            }{" "}
            required lessons
          </span>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {enrollment.status ===
        "COMPLETED" && (

        <div className="student-success">

          <strong>
            Course completed!
          </strong>

          <p>
            You have completed all required
            lessons in this course.
          </p>

        </div>

      )}

      <div className="learning-sections">

        {sections.map(
          (section) => (

            <article
              key={section.id}
              className="learning-section"
            >

              <div className="learning-section-header">

                <div>

                  <span className="builder-order">
                    Section{" "}
                    {section.sort_order}
                  </span>

                  <h2>
                    {section.title}
                  </h2>

                  {section.description && (
                    <p>
                      {
                        section.description
                      }
                    </p>
                  )}

                </div>

              </div>

              <div className="learning-lessons">

                {section.lessons.map(
                  (lesson) => {

                    const lessonId =
                      Number(lesson.id);

                    const isCompleted =
                      completedLessons.has(
                        lessonId
                      );

                    const isOpen =
                      openLessonId ===
                      lessonId;

                    const canComplete =
                      lessonReady.has(
                        lessonId
                      );

                    const isCompleting =
                      Number(
                        completingLessonId
                      ) ===
                      lessonId;

                    return (
                      <article
                        key={lesson.id}
                        className={
                          isCompleted
                            ? "learning-lesson completed"
                            : "learning-lesson"
                        }
                      >

                        <div className="learning-lesson-header">

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
                                {
                                  lesson.content_type
                                }
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

                              {lesson.is_required && (
                                <span>
                                  Required
                                </span>
                              )}

                            </div>

                          </div>

                          <div className="learning-lesson-actions">

                            {isCompleted ? (

                              <span className="completed-label">
                                ✓ Completed
                              </span>

                            ) : (

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenLesson(
                                    lessonId
                                  )
                                }
                              >
                                {isOpen
                                  ? "Close Lesson"
                                  : "Open Lesson"}
                              </button>

                            )}

                          </div>

                        </div>

                        {isOpen && (
                          <div className="lesson-learning-area">

                            <div
                              className="lesson-content-scroll"
                              onScroll={(
                                event
                              ) =>
                                handleLessonScroll(
                                  event,
                                  lessonId
                                )
                              }
                            >

                              <div className="lesson-content">

                                {lesson.description && (
                                  <div className="lesson-description">

                                    <h4>
                                      About this lesson
                                    </h4>

                                    <p>
                                      {
                                        lesson.description
                                      }
                                    </p>

                                  </div>
                                )}

                                {lesson.content_type ===
                                  "VIDEO" &&
                                  lesson.content_url && (

                                    <div className="lesson-video">

                                      <h4>
                                        Learning Material
                                      </h4>

                                      <video
                                        controls
                                        width="100%"
                                      >

                                        <source
                                          src={
                                            lesson.content_url
                                          }
                                        />

                                        Your browser does not
                                        support video playback.

                                      </video>

                                    </div>

                                  )}

                                {lesson.content_type ===
                                  "ARTICLE" && (

                                    <div className="lesson-article">

                                      <h4>
                                        Article
                                      </h4>

                                      {lesson.content_url ? (

                                        <a
                                          href={
                                            lesson.content_url
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Open Article
                                        </a>

                                      ) : (

                                        <p>
                                          No article URL
                                          has been provided.
                                        </p>

                                      )}

                                    </div>

                                  )}

                                {lesson.content_type ===
                                  "DOCUMENT" && (

                                    <div className="lesson-document">

                                      <h4>
                                        Document
                                      </h4>

                                      {lesson.content_url ? (

                                        <iframe
                                          src={
                                            lesson.content_url
                                          }
                                          title={
                                            lesson.title
                                          }
                                          width="100%"
                                          height="500"
                                        />

                                      ) : (

                                        <p>
                                          No document URL
                                          has been provided.
                                        </p>

                                      )}

                                    </div>

                                  )}

                                {lesson.content_type ===
                                  "LINK" && (

                                    <div className="lesson-link">

                                      <h4>
                                        Learning Material
                                      </h4>

                                      {lesson.content_url ? (

                                        <a
                                          href={
                                            lesson.content_url
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Open Learning Material
                                        </a>

                                      ) : (

                                        <p>
                                          No learning URL
                                          has been provided.
                                        </p>

                                      )}

                                    </div>

                                  )}

                                {lesson.resource_url && (

                                  <div className="lesson-resource">

                                    <h4>
                                      Additional Resource
                                    </h4>

                                    <a
                                      href={
                                        lesson.resource_url
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Open Additional Resource
                                    </a>

                                  </div>

                                )}

                                <div className="lesson-reading-content">

                                  <h4>
                                    Lesson Completion
                                  </h4>

                                  <p>
                                    Please make sure you have
                                    reviewed the learning material
                                    above before completing this lesson.
                                  </p>

                                  <p>
                                    Continue scrolling to the bottom
                                    of this area to unlock the
                                    completion button.
                                  </p>

                                </div>

                                <div className="lesson-bottom-spacer">

                                  <div className="lesson-end-marker">
                                    <strong>
                                      End of Lesson
                                    </strong>

                                    <p>
                                      You have reached the end
                                      of this lesson.
                                    </p>
                                  </div>

                                </div>

                              </div>

                            </div>

                            <div className="lesson-completion-area">

                              {!canComplete && (

                                <p className="completion-hint">
                                  Scroll to the bottom of this
                                  lesson to unlock "Mark as Done".
                                </p>

                              )}

                              {canComplete &&
                                !isCompleted && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleComplete(
                                      lessonId
                                    )
                                  }
                                  disabled={
                                    Boolean(
                                      completingLessonId
                                    )
                                  }
                                >
                                  {isCompleting
                                    ? "Saving..."
                                    : "Mark as Done"}
                                </button>

                              )}

                            </div>

                          </div>
                        )}

                      </article>
                    );

                  }
                )}

              </div>

            </article>

          )
        )}

      </div>

    </section>
  );
};

export default CourseLearn;