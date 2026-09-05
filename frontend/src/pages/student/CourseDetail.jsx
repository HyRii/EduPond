import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCourseById } from "../../services/course.service";
import {
  enrollCourse,
  getMyEnrollments,
} from "../../services/enrollment.service";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const [error, setError] = useState("");
  const [enrollMessage, setEnrollMessage] = useState("");

  useEffect(() => {
    const loadCourseDetail = async () => {
      try {
        setLoading(true);
        setError("");
        setEnrollMessage("");

        const [courseResponse, enrollmentResponse] =
          await Promise.all([
            getCourseById(id),
            getMyEnrollments(),
          ]);

        console.log(
          "Course detail response:",
          courseResponse
        );

        console.log(
          "Enrollment response:",
          enrollmentResponse
        );

        setCourse(courseResponse?.data || null);

        const enrollments =
          enrollmentResponse?.data?.enrollments || [];

        const existingEnrollment =
          enrollments.find(
            (item) =>
              Number(item.course_id) === Number(id)
          );

        setEnrollment(existingEnrollment || null);
      } catch (err) {
        console.error(
          "Failed to load course detail:",
          err
        );

        setError(
          err.message || "Failed to load course."
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

      const response = await enrollCourse(id);

      console.log(
        "Enroll course response:",
        response
      );

      const newEnrollment =
        response?.data?.enrollment || null;

      setEnrollment(newEnrollment);

      setEnrollMessage(
        "You have successfully enrolled in this course."
      );
    } catch (err) {
      console.error(
        "Failed to enroll course:",
        err
      );

      if (err.status === 409) {
        setEnrollMessage(
          "You are already enrolled in this course."
        );
      } else {
        setError(
          err.message ||
            "Failed to enroll in this course."
        );
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <section>
        <p>Loading course...</p>
      </section>
    );
  }

  if (error && !course) {
    return (
      <section>
        <h1>Course Detail</h1>
        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/student/courses")
          }
        >
          Back to Courses
        </button>
      </section>
    );
  }

  if (!course) {
    return (
      <section>
        <h1>Course Detail</h1>
        <p>Course not found.</p>

        <button
          type="button"
          onClick={() =>
            navigate("/student/courses")
          }
        >
          Back to Courses
        </button>
      </section>
    );
  }

  return (
    <section>
      <button
        type="button"
        onClick={() =>
          navigate("/student/courses")
        }
      >
        ← Back to Courses
      </button>

      <div className="course-detail">
        {course.thumbnail_url && (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="course-detail-thumbnail"
          />
        )}

        <div className="course-detail-content">
          <p>{course.category_name}</p>

          <h1>{course.title}</h1>

          <p>
            Instructor: {course.instructor_name}
          </p>

          <p>
            Difficulty: {course.difficulty}
          </p>

          {course.duration_minutes && (
            <p>
              Duration:{" "}
              {course.duration_minutes} minutes
            </p>
          )}

          <hr />

          <h2>Goal</h2>

          <p>
            {course.goal ||
              "No course goal provided."}
          </p>

          <h2>Description</h2>

          <p>
            {course.description ||
              "No course description provided."}
          </p>

          {enrollMessage && (
            <p>
              {enrollMessage}
            </p>
          )}

          {error && (
            <p>
              {error}
            </p>
          )}

          {enrollment ? (
            <div>
              <p>
                ✓ You are already enrolled in
                this course.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/my-courses")
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