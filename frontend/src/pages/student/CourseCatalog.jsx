import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCourses } from "../../services/course.service";

const CourseCatalog = () => {

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

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
          "Failed to load courses."
        );

      } finally {

        setLoading(false);

      }

    };

    loadCourses();

  }, []);

  if (loading) {

    return (
      <section className="student-page">

        <div className="student-page-header">

          <div>
            <p className="page-eyebrow">
              STUDENT
            </p>

            <h1>Browse Courses</h1>
          </div>

        </div>

        <div className="student-state">
          Loading courses...
        </div>

      </section>
    );

  }

  if (error) {

    return (
      <section className="student-page">

        <div className="student-page-header">

          <div>
            <p className="page-eyebrow">
              STUDENT
            </p>

            <h1>Browse Courses</h1>
          </div>

        </div>

        <div className="student-error">
          {error}
        </div>

      </section>
    );

  }

  return (
    <section className="student-page">

      <div className="student-page-header">

        <div>

          <p className="page-eyebrow">
            STUDENT
          </p>

          <h1>Browse Courses</h1>

          <p className="page-description">
            Explore published courses and start learning.
          </p>

        </div>

      </div>

      {courses.length === 0 ? (

        <div className="student-empty">

          <h2>
            No courses available
          </h2>

          <p>
            There are currently no published courses.
          </p>

        </div>

      ) : (

        <div className="student-course-grid">

          {courses.map((course) => (

            <article
              key={course.id}
              className="student-course-card"
            >

              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="student-course-thumbnail"
                />
              )}

              <div className="student-course-content">

                <p className="course-category">
                  {course.category_name ||
                    "Uncategorized"}
                </p>

                <h2>
                  {course.title}
                </h2>

                <p>
                  {course.description ||
                    "No description available."}
                </p>

                <div className="course-meta">

                  <span>
                    Difficulty:{" "}
                    {course.difficulty || "-"}
                  </span>

                  {course.duration_minutes && (
                    <span>
                      Duration:{" "}
                      {course.duration_minutes} min
                    </span>
                  )}

                </div>

                <Link
                  to={`/student/courses/${course.id}`}
                  className="primary-link"
                >
                  View Course
                </Link>

              </div>

            </article>

          ))}

        </div>

      )}

    </section>
  );
};

export default CourseCatalog;