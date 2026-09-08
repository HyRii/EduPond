import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInstructorDashboard } from "../../services/dashboard.service";
import EmptyState from "../../components/common/EmptyState";

const InstructorDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getInstructorDashboard();
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
    <section className="instructor-page">
      <div className="instructor-page-header">
        <div>
          <p className="page-eyebrow">INSTRUCTOR</p>
          <h1>Instructor Dashboard</h1>
          <p className="page-description">
            Track your courses, enrollments, and proposal status at a glance.
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
                <p className="metric-label">Published Courses</p>
                <p className="metric-value">{metrics.courses.PUBLISHED}</p>
                <p className="metric-hint">
                  {metrics.courses.total} course
                  {metrics.courses.total === 1 ? "" : "s"} total
                </p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Draft Courses</p>
                <p className="metric-value">{metrics.courses.DRAFT}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Pending Review</p>
                <p className="metric-value">
                  {metrics.courses.PENDING_REVIEW}
                </p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Total Enrollments</p>
                <p className="metric-value">{metrics.totalEnrollments}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Proposals Pending Review</p>
                <p className="metric-value">
                  {metrics.proposals.PENDING_REVIEW}
                </p>
                <p className="metric-hint">
                  {metrics.proposals.total} proposal
                  {metrics.proposals.total === 1 ? "" : "s"} total
                </p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Available Demand</p>
                <p className="metric-value">{metrics.availableDemand}</p>
                <p className="metric-hint">
                  Approved Ask Course requests you can propose against
                </p>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Recent Enrollments</h2>
              </div>

              {metrics.recentEnrollments.length ? (
                <div className="admin-list">
                  {metrics.recentEnrollments.map((row) => (
                    <article
                      key={row.enrollment_id}
                      className="admin-list-item"
                    >
                      <div>
                        <div className="admin-list-title">
                          <h3>{row.course_title}</h3>
                        </div>
                        <p>Student: {row.student_name}</p>
                      </div>
                      <span className="badge">{row.status}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No enrollments yet"
                  message="Once students enroll in your published courses, they'll show up here."
                />
              )}
            </div>

            <div className="instructor-card-grid">
              <Link to="/instructor/courses" className="instructor-navigation-card">
                <h2>My Courses</h2>
                <p>Create, edit, organize, and submit your courses.</p>
              </Link>

              <Link
                to="/instructor/course-requests"
                className="instructor-navigation-card"
              >
                <h2>Course Requests</h2>
                <p>See approved student demand you can build a course for.</p>
              </Link>

              <Link to="/instructor/proposals" className="instructor-navigation-card">
                <h2>Proposals</h2>
                <p>Track your proposal status and admin feedback.</p>
              </Link>
            </div>
          </>
        )
      )}
    </section>
  );
};

export default InstructorDashboard;
