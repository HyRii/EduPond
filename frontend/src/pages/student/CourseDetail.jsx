import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../../services/course.service";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCourseById(id);

        console.log("Course detail response:", response);

        setCourse(response?.data || null);
      } catch (err) {
        console.error("Failed to load course:", err);

        setError(
          err.message || "Failed to load course."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <section>
        <p>Loading course...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1>Course Detail</h1>
        <p>{error}</p>

        <button
          type="button"
          onClick={() => navigate("/student/courses")}
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
          onClick={() => navigate("/student/courses")}
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
        onClick={() => navigate("/student/courses")}
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
              Duration: {course.duration_minutes} minutes
            </p>
          )}

          <hr />

          <h2>Goal</h2>
          <p>
            {course.goal || "No course goal provided."}
          </p>

          <h2>Description</h2>
          <p>
            {course.description ||
              "No course description provided."}
          </p>

          <button type="button">
            Enroll Course
          </button>
        </div>
      </div>
    </section>
  );
};

export default CourseDetail;