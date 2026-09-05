import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyEnrollments } from "../../services/enrollment.service";

const MyCourses = () => {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyEnrollments();

        console.log("MY COURSES RESPONSE:", response);

        const courses =
          response?.data?.enrollments || [];

        console.log("MY COURSES DATA:", courses);

        setEnrollments(courses);
      } catch (err) {
        console.error("MY COURSES ERROR:", err);

        setError(
          err.message || "Failed to load your courses."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="my-courses-page">
        <h1>My Courses</h1>
        <p>Loading your courses...</p>
      </section>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <section className="my-courses-page">
        <h1>My Courses</h1>

        <p>{error}</p>

        <button
          type="button"
          onClick={() => navigate("/student/courses")}
        >
          Browse Courses
        </button>
      </section>
    );
  }

  // =========================
  // SUCCESS
  // =========================

  return (
    <section className="my-courses-page">
      <h1>My Courses</h1>

      <p>
        Courses you have enrolled in.
      </p>

      {/* EMPTY STATE */}

      {enrollments.length === 0 && (
        <div className="empty-courses">
          <h2>No Courses Yet</h2>

          <p>
            You have not enrolled in any courses yet.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/student/courses")
            }
          >
            Browse Courses
          </button>
        </div>
      )}

      {/* COURSE LIST */}

      {enrollments.length > 0 && (
        <div className="my-courses">
          {enrollments.map((enrollment) => (
            <article
              key={enrollment.id}
              className="my-course-card"
            >
              {enrollment.thumbnail_url && (
                <img
                  src={enrollment.thumbnail_url}
                  alt={enrollment.title}
                  className="my-course-thumbnail"
                />
              )}

              <div className="my-course-content">
                <p>
                  {enrollment.category_name}
                </p>

                <h2>
                  {enrollment.title}
                </h2>

                <p>
                  Instructor:{" "}
                  {enrollment.instructor_name}
                </p>

                <p>
                  Difficulty:{" "}
                  {enrollment.difficulty}
                </p>

                {enrollment.duration_minutes && (
                  <p>
                    Duration:{" "}
                    {enrollment.duration_minutes} minutes
                  </p>
                )}

                <p>
                  Status:{" "}
                  {enrollment.status}
                </p>

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
          ))}
        </div>
      )}
    </section>
  );
};

export default MyCourses;