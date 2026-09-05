import { Link } from "react-router-dom";

const StudentHome = () => {
  return (
    <section className="student-page">

      <div className="student-page-header">

        <div>

          <p className="page-eyebrow">
            STUDENT
          </p>

          <h1>Welcome to EduPond</h1>

          <p className="page-description">
            Explore courses, continue your learning journey,
            and manage your enrolled courses.
          </p>

        </div>

      </div>

      <div className="student-card-grid">

        <Link
          to="/student/courses"
          className="student-navigation-card"
        >
          <h2>Browse Courses</h2>

          <p>
            Explore published courses and find something
            worth learning.
          </p>
        </Link>

        <Link
          to="/student/my-courses"
          className="student-navigation-card"
        >
          <h2>My Courses</h2>

          <p>
            Open the courses you have already enrolled in.
          </p>
        </Link>

        <div className="student-navigation-card disabled-card">

          <h2>Ask Course</h2>

          <p>
            Request a course that is not available yet.
            Available in Phase 4.
          </p>

        </div>

        <div className="student-navigation-card disabled-card">

          <h2>Certificates</h2>

          <p>
            View earned certificates after completing
            the learning requirements.
          </p>

        </div>

      </div>

    </section>
  );
};

export default StudentHome;