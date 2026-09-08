
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudentDashboard } from "../../services/dashboard.service";
import EmptyState from "../../components/common/EmptyState";

const StudentDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getStudentDashboard();
        setMetrics(response?.data?.metrics || null);
      } catch (err) {
        setError(err.message || "Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="student-page">
      <div className="student-page-header">
        <div>
          <p className="page-eyebrow">STUDENT</p>
          <h1>Welcome back</h1>
          <p className="page-description">
            Here's how your learning is going across all your enrolled
            courses.
          </p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading metrics...</div>
      ) : (
        metrics && (
          <>
            <div className="metric-grid">
              <div className="metric-card">
                <p className="metric-label">Active Courses</p>
                <p className="metric-value">{metrics.enrollments.ACTIVE}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Completed Courses</p>
                <p className="metric-value">
                  {metrics.enrollments.COMPLETED}
                </p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Certificates Earned</p>
                <p className="metric-value">{metrics.certificatesCount}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Overall Progress</p>
                <p className="metric-value">{metrics.averageProgress}%</p>
                <div className="progress-track">
                  <div
                    className="progress-track-fill"
                    style={{ width: `${metrics.averageProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Continue Learning</h2>
              </div>

              {metrics.continueLearning.length ? (
                <div className="student-card-grid">
                  {metrics.continueLearning.map((row) => (
                    <Link
                      key={row.enrollment_id}
                      to={`/student/my-courses/${row.enrollment_id}`}
                      className="student-navigation-card"
                    >
                      <h2>{row.title}</h2>
                      <p>Difficulty: {row.difficulty}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing in progress"
                  message="Enroll in a course to start tracking your learning progress here."
                />
              )}
            </div>

            <div className="student-card-grid">
              <Link to="/student/courses" className="student-navigation-card">
                <h2>Browse Courses</h2>
                <p>Explore published courses and find something worth learning.</p>
              </Link>

              <Link to="/student/my-courses" className="student-navigation-card">
                <h2>My Courses</h2>
                <p>Open the courses you have already enrolled in.</p>
              </Link>

              <Link
                to="/student/course-requests"
                className="student-navigation-card"
              >
                <h2>Ask Course</h2>
                <p>
                  Request a course that isn't available yet.{" "}
                  {metrics.requests.total > 0 &&
                    `You have ${metrics.requests.total} request${
                      metrics.requests.total === 1 ? "" : "s"
                    } so far.`}
                </p>
              </Link>

              <Link to="/student/certificates" className="student-navigation-card">
                <h2>Certificates</h2>
                <p>View the certificates you've earned so far.</p>
              </Link>
            </div>
          </>
        )
      )}
    </section>
  );
};

export default StudentDashboard;
