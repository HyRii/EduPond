import { useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <article className="course-card">
      <div className="course-card-thumbnail">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
          />
        ) : (
          <div className="course-card-placeholder">
            No Image
          </div>
        )}
      </div>

      <div className="course-card-content">
        <span className="course-card-category">
          {course.category_name}
        </span>

        <h3>{course.title}</h3>

        <p className="course-card-instructor">
          Instructor: {course.instructor_name}
        </p>

        <div className="course-card-meta">
          <span>{course.difficulty}</span>

          {course.duration_minutes !== null &&
            course.duration_minutes !== undefined && (
              <span>
                {course.duration_minutes} min
              </span>
            )}
        </div>

        <button
          type="button"
          onClick={handleViewCourse}
        >
          View Course
        </button>
      </div>
    </article>
  );
};

export default CourseCard;