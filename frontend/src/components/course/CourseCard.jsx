import { Link } from "react-router-dom";
import WaterLilyButton from "../common/WaterLilyButton";

const CourseCard = ({ course }) => {
  return (
    <article className="course-card group">
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
          {course.category_name || "Uncategorized"}
        </span>

        <h3>{course.title}</h3>

        <p className="course-card-instructor">
          Instructor: {course.instructor_name}
        </p>

        <div className="course-card-meta">
          {course.difficulty && <span>{course.difficulty}</span>}

          {course.duration_minutes !== null &&
            course.duration_minutes !== undefined && (
              <span>{course.duration_minutes} min</span>
            )}
        </div>

        <WaterLilyButton
          as={Link}
          to={`/student/courses/${course.id}`}
          variant="leaf"
          className="mt-auto"
        >
          View Course
        </WaterLilyButton>
      </div>
    </article>
  );
};

export default CourseCard;
