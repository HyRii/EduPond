import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyEnrollments,
} from "../../services/enrollment.service";

const MyCourses = () => {

  const navigate = useNavigate();

  const [enrollments, setEnrollments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    const loadMyCourses =
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await getMyEnrollments();

          setEnrollments(
            response?.data?.enrollments ||
            []
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

    loadMyCourses();

  }, []);

  if (loading) {

    return (
      <section className="student-page">

        <div className="student-page-header">

          <div>
            <p className="page-eyebrow">
              STUDENT
            </p>

            <h1>My Courses</h1>
          </div>

        </div>

        <div className="student-state">
          Loading your courses...
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

            <h1>My Courses</h1>
          </div>

        </div>

        <div className="student-error">
          {error}
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/courses"
            )
          }
        >
          Browse Courses
        </button>

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

          <h1>My Courses</h1>

          <p className="page-description">
            Courses you have enrolled in.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/courses"
            )
          }
        >
          Browse Courses
        </button>

      </div>

      {enrollments.length === 0 ? (

        <div className="student-empty">

          <h2>
            No Courses Yet
          </h2>

          <p>
            You have not enrolled in any courses yet.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/courses"
              )
            }
          >
            Browse Courses
          </button>

        </div>

      ) : (

        <div className="student-course-grid">

          {enrollments.map(
            (enrollment) => (

              <article
                key={enrollment.id}
                className="student-course-card group"
              >

                {enrollment.thumbnail_url && (

                  <img
                    src={
                      enrollment.thumbnail_url
                    }
                    alt={
                      enrollment.title
                    }
                    className="student-course-thumbnail"
                  />

                )}

                <div className="student-course-content">

                  <p className="course-category">
                    {enrollment.category_name ||
                      "Uncategorized"}
                  </p>

                  <h2>
                    {enrollment.title}
                  </h2>

                  <p>
                    Instructor:{" "}
                    {enrollment.instructor_name ||
                      "-"}
                  </p>

                  <div className="course-meta">

                    <span>
                      Difficulty:{" "}
                      {enrollment.difficulty ||
                        "-"}
                    </span>

                    {enrollment.duration_minutes && (
                      <span>
                        Duration:{" "}
                        {
                          enrollment.duration_minutes
                        }{" "}
                        min
                      </span>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/my-courses/${enrollment.id}`
                      )
                    }
                  >
                    Open Course
                  </button>

                </div>

              </article>

            )
          )}

        </div>

      )}

    </section>
  );
};

export default MyCourses;