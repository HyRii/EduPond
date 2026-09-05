import { Link } from "react-router-dom";

const InstructorHome = () => {
  return (
    <section className="instructor-page">

      <div className="instructor-page-header">

        <div>

          <p className="page-eyebrow">
            INSTRUCTOR
          </p>

          <h1>Instructor Dashboard</h1>

          <p className="page-description">
            Build your courses and prepare them for review.
          </p>

        </div>

      </div>

      <div className="instructor-card-grid">

        <Link
          to="/instructor/courses"
          className="instructor-navigation-card"
        >
          <h2>My Courses</h2>

          <p>
            Create, edit, organize, and submit your courses.
          </p>
        </Link>

        <div className="instructor-navigation-card disabled-card">

          <h2>Course Requests</h2>

          <p>
            Accepted student demand will be available here
            in Phase 4.
          </p>

        </div>

        <div className="instructor-navigation-card disabled-card">

          <h2>Proposals</h2>

          <p>
            Instructor proposal workflow will be available
            in Phase 4.
          </p>

        </div>

      </div>

    </section>
  );
};

export default InstructorHome;