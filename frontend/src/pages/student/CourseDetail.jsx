import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getCourseById,
} from "../../services/course.service";

import {
  enrollCourse,
  getMyEnrollments,
} from "../../services/enrollment.service";

const CourseDetail = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [course, setCourse] =
    useState(null);

  const [enrollment, setEnrollment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [enrolling, setEnrolling] =
    useState(false);

  const [error, setError] =
    useState("");

  const [enrollMessage, setEnrollMessage] =
    useState("");

  useEffect(() => {

    const loadCourseDetail =
      async () => {

        try {

          setLoading(true);
          setError("");
          setEnrollMessage("");

          const [
            courseResponse,
            enrollmentResponse,
          ] = await Promise.all([
            getCourseById(id),
            getMyEnrollments(),
          ]);

          /*
           * Backend response:
           *
           * {
           *   data: {
           *     course: {...}
           *   }
           * }
           */
          const courseData =
            courseResponse?.data?.course;

          setCourse(
            courseData || null
          );

          const enrollments =
            enrollmentResponse?.data
              ?.enrollments || [];

          const existingEnrollment =
            enrollments.find(
              (item) =>
                Number(item.course_id) ===
                Number(id)
            );

          setEnrollment(
            existingEnrollment || null
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

    loadCourseDetail();

  }, [id]);

  const handleEnroll = async () => {

    if (enrolling || enrollment) {
      return;
    }

    try {

      setEnrolling(true);
      setError("");
      setEnrollMessage("");

      const response =
        await enrollCourse(id);

      const newEnrollment =
        response?.data?.enrollment ||
        null;

      setEnrollment(
        newEnrollment
      );

      setEnrollMessage(
        "You have successfully enrolled in this course."
      );

    } catch (error) {

      if (error.status === 409) {

        setEnrollMessage(
          "You are already enrolled in this course."
        );

      } else {

        setError(
          error.message ||
          "Failed to enroll in this course."
        );

      }

    } finally {

      setEnrolling(false);

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

  if (error && !course) {

    return (
      <section className="student-page">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/courses"
            )
          }
        >
          ← Back to Courses
        </button>

        <div className="student-error">
          {error}
        </div>

      </section>
    );

  }

  if (!course) {

    return (
      <section className="student-page">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/courses"
            )
          }
        >
          ← Back to Courses
        </button>

        <div className="student-empty">

          <h2>
            Course not found
          </h2>

          <p>
            The requested course could not be found.
          </p>

        </div>

      </section>
    );

  }

  return (
    <section className="student-page">

      <button
        type="button"
        className="back-button"
        onClick={() =>
          navigate(
            "/student/courses"
          )
        }
      >
        ← Back to Courses
      </button>

      <div className="student-course-detail">

        {course.thumbnail_url && (

          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="student-detail-thumbnail"
          />

        )}

        <div className="student-detail-content">

          <p className="course-category">
            {course.category_name ||
              "Uncategorized"}
          </p>

          <h1>
            {course.title}
          </h1>

          <div className="course-meta">

            <span>
              Instructor:{" "}
              {course.instructor_name ||
                "-"}
            </span>

            <span>
              Difficulty:{" "}
              {course.difficulty ||
                "-"}
            </span>

            {course.duration_minutes && (
              <span>
                Duration:{" "}
                {course.duration_minutes} minutes
              </span>
            )}

          </div>

          <div className="student-detail-section">

            <h2>
              Goal
            </h2>

            <p>
              {course.goal ||
                "No course goal provided."}
            </p>

          </div>

          <div className="student-detail-section">

            <h2>
              Description
            </h2>

            <p>
              {course.description ||
                "No course description provided."}
            </p>

          </div>

          {enrollMessage && (

            <div className="student-success">
              {enrollMessage}
            </div>

          )}

          {error && (

            <div className="student-error">
              {error}
            </div>

          )}

          {enrollment ? (

            <div className="student-enrolled">

              <p>
                ✓ You are already enrolled in
                this course.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/student/my-courses"
                  )
                }
              >
                Go to My Courses
              </button>

            </div>

          ) : (

            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling
                ? "Enrolling..."
                : "Enroll Course"}
            </button>

          )}

        </div>

      </div>

    </section>
  );
};

export default CourseDetail;