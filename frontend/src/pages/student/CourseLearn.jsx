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

import {
  getQuizByLessonId,
} from "../../services/quiz.service";

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

  const [lessonQuizzes, setLessonQuizzes] =
    useState({});

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
   * Lesson yang sudah discroll sampai
   * bagian paling bawah.
   */
  const [lessonReady, setLessonReady] =
    useState(new Set());

  const loadCourse = async () => {

    try {

      setLoading(true);
      setError("");

      /*
       * Ambil enrollment terlebih dahulu.
       */
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

      /*
       * Ambil semua section course.
       */
      const sectionsResponse =
        await getSectionsByCourseId(
          enrollmentData.course_id
        );

      const rawSections =
        sectionsResponse
          ?.data
          ?.sections || [];

      /*
       * Ambil lesson untuk setiap section.
       */
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

      /*
       * Ambil lesson yang sudah completed
       * dari enrollment.
       */
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

      /*
       * Cari quiz untuk setiap lesson.
       *
       * Lesson tanpa quiz akan mendapatkan null.
       */
      const quizMap = {};

      await Promise.all(
        sectionsWithLessons.map(
          async (section) => {

            await Promise.all(
              section.lessons.map(
                async (lesson) => {

                  try {

                    const response =
                      await getQuizByLessonId(
                        lesson.id
                      );

                    quizMap[
                      Number(
                        lesson.id
                      )
                    ] =
                      response
                        ?.data
                        ?.quiz ||
                      null;

                  } catch (error) {

                    /*
                     * Jangan membuat seluruh
                     * halaman learning gagal
                     * hanya karena sebuah lesson
                     * tidak memiliki quiz.
                     */
                    quizMap[
                      Number(
                        lesson.id
                      )
                    ] = null;

                  }

                }
              )
            );

          }
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
       * Lesson completed dianggap sudah ready
       * sehingga student tidak perlu membuka
       * dan scroll ulang.
       */
      setLessonReady(
        new Set(progressIds)
      );

      setLessonQuizzes(
        quizMap
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
   * Buka atau tutup lesson.
   */
  const handleOpenLesson = (
    lessonId
  ) => {

    const numericLessonId =
      Number(lessonId);

    if (
      openLessonId ===
      numericLessonId
    ) {

      setOpenLessonId(null);

      return;

    }

    setOpenLessonId(
      numericLessonId
    );

    /*
     * Hapus error lama ketika student
     * membuka lesson baru.
     */
    setError("");

  };

  /*
   * Cek apakah student sudah mencapai
   * bagian paling bawah learning area.
   */
  const handleLessonScroll = (
    event,
    lessonId
  ) => {

    const element =
      event.currentTarget;

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
     * Frontend gate:
     * lesson harus sudah discroll
     * sampai bottom.
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
     * Jangan submit dua kali.
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
       * Update local state.
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
       * Refresh enrollment supaya
       * progress percentage,
       * completed lesson count,
       * dan status enrollment
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

      /*
       * Kalau lesson mempunyai quiz,
       * quiz akan tersedia setelah lesson
       * selesai.
       */

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

  /*
   * NEW (Phase 3B):
   * Find the lesson (and its parent section, for the breadcrumb)
   * that is currently open, so it can be rendered as a full-screen
   * reader instead of an inline card. `sections` is nested
   * (section -> lessons), so it needs a small search rather than a
   * plain lookup by id.
   */
  const openLessonId_num =
    Number(openLessonId);

  let openLesson = null;
  let openLessonSection = null;

  if (openLessonId) {

    for (const section of sections) {

      const match =
        section.lessons.find(
          (lesson) =>
            Number(lesson.id) ===
            openLessonId_num
        );

      if (match) {
        openLesson = match;
        openLessonSection = section;
        break;
      }

    }

  }

  const isOpenLessonCompleted =
    completedLessons.has(
      openLessonId_num
    );

  const canCompleteOpenLesson =
    lessonReady.has(
      openLessonId_num
    );

  const isCompletingOpenLesson =
    Number(completingLessonId) ===
    openLessonId_num;

  const openLessonQuiz =
    lessonQuizzes[
      openLessonId_num
    ];

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

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/certificates"
              )
            }
          >
            View My Certificates
          </button>

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

                    /*
                     * EDITED (Phase 3B): canComplete / isCompleting /
                     * quiz used to be computed here too, for the old
                     * inline "lesson-learning-area" card. That card
                     * is gone (the reader is now the full-screen
                     * overlay below), and the overlay uses its own
                     * equivalents (canCompleteOpenLesson,
                     * isCompletingOpenLesson, openLessonQuiz,
                     * computed near `progress`), so those three are
                     * no longer needed in this per-lesson-card scope.
                     */

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
                              {
                                lesson.sort_order
                              }
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
                                {/*
                                  EDITED (Phase 3B): this button now
                                  always opens the full-screen reader
                                  (see lesson-fullscreen-overlay
                                  below). Closing happens from the
                                  "← Back to Course" button inside
                                  that overlay, not by clicking this
                                  button again, so the previous
                                  "Close Lesson" toggle label is gone.
                                */}
                                {isOpen
                                  ? "Continue Lesson"
                                  : "Open Lesson"}
                              </button>

                            )}

                          </div>

                        </div>

                        {/*
                          EDITED (Phase 3B):
                          The lesson content used to render inline,
                          right here, as a small expanding card inside
                          the section list ("isOpen && (<div
                          className="lesson-learning-area">...")).
                          That's the "cuma card kecil" behaviour that
                          was reported as a problem.

                          The lesson reader is now a dedicated
                          full-screen overlay (see the
                          "lesson-fullscreen-overlay" block rendered
                          near the bottom of this component, driven by
                          the `openLesson` variable), so there is
                          nothing to render inline here anymore.
                          `isOpen` now only controls the label of the
                          "Open Lesson" button below.
                        */}

                      </article>
                    );

                  }
                )}

              </div>

            </article>

          )
        )}

      </div>

      {/*
        NEW (Phase 3B):
        Full-screen lesson reader. Renders on top of everything else
        (see .lesson-fullscreen-overlay in index.css) instead of the
        old inline "lesson-learning-area" card, so opening a lesson
        feels like opening a news article rather than expanding a
        small card in a list. Content, scroll-to-complete, and the
        completion/quiz actions are the same as before -- only the
        layout changed, and `openLesson`/`openLessonSection` etc. are
        computed above, near `progress`.
      */}
      {openLesson && (

        <div className="lesson-fullscreen-overlay">

          <div className="lesson-fullscreen-header">

            <button
              type="button"
              className="back-button"
              onClick={() =>
                setOpenLessonId(null)
              }
            >
              ← Back to Course
            </button>

            <span className="lesson-fullscreen-eyebrow">
              {openLessonSection?.title}
            </span>

          </div>

          <div
            className="lesson-fullscreen-scroll"
            onScroll={(event) =>
              handleLessonScroll(
                event,
                openLessonId_num
              )
            }
          >

            <article className="lesson-fullscreen-article">

              <p className="lesson-fullscreen-kicker">
                {openLesson.content_type}

                {openLesson.duration_minutes !=
                  null &&
                  ` • ${openLesson.duration_minutes} min`}

                {openLesson.is_required &&
                  " • Required"}
              </p>

              <h1>
                {openLesson.title}
              </h1>

              {openLesson.description && (

                <div className="lesson-description">

                  <h4>
                    About this lesson
                  </h4>

                  <p>
                    {
                      openLesson.description
                    }
                  </p>

                </div>

              )}

              {openLesson.content_type ===
                "VIDEO" &&
                openLesson.content_url && (

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
                          openLesson.content_url
                        }
                      />

                      Your browser does not
                      support video playback.

                    </video>

                  </div>

                )}

              {openLesson.content_type ===
                "ARTICLE" && (

                  <div className="lesson-article">

                    <h4>
                      Article
                    </h4>

                    {openLesson.content_url ? (

                      /*
                       * EDITED (Phase 3B): an external article link
                       * used to just open in a new tab. Now that the
                       * lesson itself already renders full-screen
                       * like a news article, it's embedded directly
                       * in an iframe so the student can read it
                       * without leaving the page (with the external
                       * link kept as a fallback for sites that block
                       * being framed).
                       */
                      <>
                        <iframe
                          src={
                            openLesson.content_url
                          }
                          title={
                            openLesson.title
                          }
                          width="100%"
                          height="600"
                        />

                        <p>
                          <a
                            href={
                              openLesson.content_url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open in a new tab
                          </a>
                        </p>
                      </>

                    ) : (

                      <p>
                        No article URL
                        has been provided.
                      </p>

                    )}

                  </div>

                )}

              {openLesson.content_type ===
                "DOCUMENT" && (

                  <div className="lesson-document">

                    <h4>
                      Document
                    </h4>

                    {openLesson.content_url ? (

                      <iframe
                        src={
                          openLesson.content_url
                        }
                        title={
                          openLesson.title
                        }
                        width="100%"
                        height="700"
                      />

                    ) : (

                      <p>
                        No document URL
                        has been provided.
                      </p>

                    )}

                  </div>

                )}

              {openLesson.content_type ===
                "LINK" && (

                  <div className="lesson-link">

                    <h4>
                      Learning Material
                    </h4>

                    {openLesson.content_url ? (

                      <a
                        href={
                          openLesson.content_url
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

              {openLesson.resource_url && (

                <div className="lesson-resource">

                  <h4>
                    Additional Resource
                  </h4>

                  <a
                    href={
                      openLesson.resource_url
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
                  Review the learning material
                  before completing this lesson.
                </p>

                <p>
                  Scroll all the way to the bottom
                  of this page to unlock the
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

            </article>

          </div>

          <div className="lesson-completion-area lesson-fullscreen-completion-area">

            {!canCompleteOpenLesson && (

              <p className="completion-hint">
                Scroll to the bottom of this
                lesson to unlock
                "Mark as Done".
              </p>

            )}

            {canCompleteOpenLesson &&
              !isOpenLessonCompleted && (

              <button
                type="button"
                onClick={() =>
                  handleComplete(
                    openLessonId_num
                  )
                }
                disabled={
                  Boolean(
                    completingLessonId
                  )
                }
              >
                {isCompletingOpenLesson
                  ? "Saving..."
                  : "Mark as Done"}
              </button>

            )}

            {isOpenLessonCompleted &&
              openLessonQuiz && (

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/student/quizzes/${openLessonQuiz.id}/${enrollmentId}`
                  )
                }
              >
                Take Quiz
              </button>

            )}

            {isOpenLessonCompleted &&
              !openLessonQuiz && (

              <span className="completed-label">
                ✓ Lesson completed
              </span>

            )}

          </div>

        </div>

      )}

    </section>
  );
};

export default CourseLearn;