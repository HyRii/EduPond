import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

import {
  getCourses,
  submitCourse,
  deleteCourse,
} from "../../services/course.service";

const InstructorCourses = () => {

  const [courses, setCourses] = useState([]);

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

      setCourses(
        response?.data?.courses || []
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to load your courses."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSubmit = async (courseId) => {

    const confirmed = window.confirm(
      "Submit this course for review?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await submitCourse(courseId);

      await loadCourses();

    } catch (error) {

      setError(
        error.message ||
        "Failed to submit course."
      );

    }
  };

  const handleDelete = async (courseId) => {

    const confirmed = window.confirm(
      "Delete this draft course?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await deleteCourse(courseId);

      await loadCourses();

    } catch (error) {

      setError(
        error.message ||
        "Failed to delete course."
      );

    }
  };

  const canEdit = (status) =>
    status === "DRAFT" ||
    status === "REJECTED";

  const canDelete = (status) =>
    status === "DRAFT";

  const canSubmit = (status) =>
    status === "DRAFT";

  return (
    <section className="instructor-page">

      <div className="instructor-page-header">

        <div>

          <p className="page-eyebrow">
            INSTRUCTOR
          </p>

          <h1>My Courses</h1>

          <p className="page-description">
            Create and manage your courses.
          </p>

        </div>

        <Link
          to="/instructor/courses/new"
          className="primary-link"
        >
          Create Course
        </Link>

      </div>

      {error && (
        <div className="instructor-error">
          {error}
        </div>
      )}

      {loading ? (

        <div className="instructor-loading">
          Loading your courses...
        </div>

      ) : courses.length === 0 ? (

        <EmptyState
          title="No courses yet"
          message="Create your first course draft to get started."
        />

      ) : (

        <div className="instructor-list">

          {courses.map((course) => (

            <article
              key={course.id}
              className="instructor-list-item"
            >

              <div className="instructor-course-info">

                <div className="instructor-course-header">

                  <h2>
                    {course.title}
                  </h2>

                  <Badge
                    variant={
                      course.status === "PUBLISHED"
                        ? "success"
                        : course.status === "REJECTED"
                          ? "danger"
                          : "default"
                    }
                  >
                    {course.status}
                  </Badge>

                </div>

                <p>
                  {course.description ||
                    "No course description yet."}
                </p>

                <div className="course-meta">

                  <span>
                    Category:{" "}
                    {course.category_name || "-"}
                  </span>

                  <span>
                    Difficulty:{" "}
                    {course.difficulty || "-"}
                  </span>

                  <span>
                    Duration:{" "}
                    {course.duration_minutes
                      ? `${course.duration_minutes} min`
                      : "-"}
                  </span>

                </div>

              </div>

              <div className="instructor-actions">

                {canEdit(course.status) && (
                  <Link
                    to={`/instructor/courses/${course.id}/edit`}
                  >
                    Edit
                  </Link>
                )}

                {canEdit(course.status) && (
                  <Link
                    to={`/instructor/courses/${course.id}/builder`}
                  >
                    Builder
                  </Link>
                )}

                {canSubmit(course.status) && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSubmit(course.id)
                    }
                  >
                    Submit Review
                  </button>
                )}

                {canDelete(course.status) && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(course.id)
                    }
                  >
                    Delete
                  </button>
                )}

              </div>

            </article>

          ))}

        </div>

      )}

    </section>
  );
};

export default InstructorCourses;