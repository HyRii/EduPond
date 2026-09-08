import { useEffect, useState } from "react";

import { getCourses } from "../../services/course.service";
import CourseCard from "../../components/course/CourseCard";
import EmptyState from "../../components/common/EmptyState";

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

        setCourses(response?.data?.courses || []);
      } catch (error) {
        setError(error.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <section className="student-page">
      <div className="student-page-header">
        <div>
          <p className="page-eyebrow">STUDENT</p>
          <h1>Browse Courses</h1>
          <p className="page-description">
            Explore published courses and start learning.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="student-state">Loading courses...</div>
      ) : error ? (
        <div className="student-error">{error}</div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses available"
          message="There are currently no published courses."
        />
      ) : (
        <div className="student-course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CourseCatalog;
