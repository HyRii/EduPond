import { useEffect, useState } from "react";
import { getCourses } from "../../services/course.service";
import CourseCard from "../../components/course/CourseCard";

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCourses();
        console.log("Courses API response:", response);
        setCourses(response?.data?.courses || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <section>
        <h1>Course Catalog</h1>
        <p>Loading courses...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1>Course Catalog</h1>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section>
      <div>
        <h1>Course Catalog</h1>
        <p>Explore courses and start your learning journey.</p>
      </div>

      {courses.length === 0 ? (
        <p>No published courses available.</p>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CourseCatalog;