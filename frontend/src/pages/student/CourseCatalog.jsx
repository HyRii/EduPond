import {
  useEffect,
  useState,
} from "react";

import {
  getCourses,
} from "../../services/course.service";

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
        const response =
          await getCourses();

        setCourses(
          response?.data?.courses || []
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to load courses"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Explore Courses</h1>

      {courses.length === 0 ? (
        <p>
          No published courses available.
        </p>
      ) : (
        <div>
          {courses.map((course) => (
            <article key={course.id}>
              <h2>{course.title}</h2>

              <p>
                {course.description}
              </p>

              <p>
                Instructor:{" "}
                {course.instructor_name}
              </p>

              <p>
                Category:{" "}
                {course.category_name}
              </p>

              <p>
                Difficulty:{" "}
                {course.difficulty}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default CourseCatalog;