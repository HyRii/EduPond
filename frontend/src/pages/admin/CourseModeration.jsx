import { useEffect, useState } from "react";

import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

import {
  getCourses,
  publishCourse,
  rejectCourse,
} from "../../services/course.service";

const CourseModeration = () => {

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadCourses = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getCourses();

      const allCourses =
        response?.data?.courses || [];

      const pendingCourses =
        allCourses.filter(
          (course) =>
            course.status ===
            "PENDING_REVIEW"
        );

      setCourses(
        pendingCourses
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to load courses."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handlePublish = async (courseId) => {

    const confirmed = window.confirm(
      "Publish this course?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await publishCourse(
        courseId
      );

      await loadCourses();

    } catch (error) {

      setError(
        error.message ||
        "Failed to publish course."
      );

    }
  };

  const handleReject = async (courseId) => {

    const confirmed = window.confirm(
      "Reject this course?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await rejectCourse(
        courseId
      );

      await loadCourses();

    } catch (error) {

      setError(
        error.message ||
        "Failed to reject course."
      );

    }
  };

  return (
    <section className="admin-page">

      <div className="admin-page-header">

        <div>

          <p className="page-eyebrow">
            ADMIN
          </p>

          <h1>Course Moderation</h1>

          <p className="page-description">
            Review courses submitted by instructors.
          </p>

        </div>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {loading ? (

        <div className="admin-loading">
          Loading courses...
        </div>

      ) : courses.length === 0 ? (

        <EmptyState
          title="No pending courses"
          message="There are currently no courses waiting for moderation."
        />

      ) : (

        <div className="admin-list">

          {courses.map((course) => (

            <article
              key={course.id}
              className="admin-list-item"
            >

              <div>

                <div className="admin-list-title">

                  <h2>
                    {course.title}
                  </h2>

                  <Badge>
                    {course.status}
                  </Badge>

                </div>

                <p>
                  {course.description ||
                    "No description."}
                </p>

                <div className="course-meta">

                  <span>
                    Category:{" "}
                    {course.category_name ||
                      "-"}
                  </span>

                  <span>
                    Instructor:{" "}
                    {course.instructor_name ||
                      "-"}
                  </span>

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  onClick={() =>
                    handlePublish(
                      course.id
                    )
                  }
                >
                  Publish
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleReject(
                      course.id
                    )
                  }
                >
                  Reject
                </button>

              </div>

            </article>

          ))}

        </div>

      )}

    </section>
  );
};

export default CourseModeration;