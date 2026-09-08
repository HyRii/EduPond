import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../services/dashboard.service";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";

const COURSE_STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminDashboard();
        setMetrics(response?.data?.metrics || null);
      } catch (err) {
        setError(err.message || "Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const demandColumns = [
    { key: "course_name", label: "Requested Course" },
    { key: "category_name", label: "Category" },
    {
      key: "request_count",
      label: "Requests",
      render: (row) => `${row.request_count}`,
    },
  ];

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="page-eyebrow">ADMIN PANEL</p>
          <h1>Admin Dashboard</h1>
          <p className="page-description">
            A snapshot of the whole platform: users, course pipeline, and
            student demand.
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
                <p className="metric-label">Students</p>
                <p className="metric-value">{metrics.users.students}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Instructors</p>
                <p className="metric-value">{metrics.users.instructors}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Published Courses</p>
                <p className="metric-value">{metrics.courses.PUBLISHED}</p>
                <p className="metric-hint">
                  {metrics.courses.total} total course
                  {metrics.courses.total === 1 ? "" : "s"}
                </p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Pending Course Reviews</p>
                <p className="metric-value">
                  {metrics.courses.PENDING_REVIEW}
                </p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Pending Proposals</p>
                <p className="metric-value">{metrics.pendingProposals}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Pending Course Requests</p>
                <p className="metric-value">
                  {metrics.pendingCourseRequests}
                </p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Total Enrollments</p>
                <p className="metric-value">{metrics.totalEnrollments}</p>
              </div>

              <div className="metric-card">
                <p className="metric-label">Certificates Issued</p>
                <p className="metric-value">
                  {metrics.totalCertificatesIssued}
                </p>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Course Pipeline</h2>
              </div>

              <div className="status-breakdown">
                {Object.entries(COURSE_STATUS_LABELS).map(([key, label]) => (
                  <span className="badge" key={key}>
                    {label}: {metrics.courses[key]}
                  </span>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Top Course Demand</h2>
                <span className="dashboard-section-note">
                  From pending/approved Ask Course requests
                </span>
              </div>

              {metrics.topDemand.length ? (
                <DataTable
                  columns={demandColumns}
                  data={metrics.topDemand.map((row, index) => ({
                    ...row,
                    id: `${row.category_id}-${row.course_name}-${index}`,
                  }))}
                />
              ) : (
                <EmptyState
                  title="No demand yet"
                  message="Once students submit Ask Course requests, the most requested courses will show up here."
                />
              )}
            </div>

            <div className="admin-card-grid">
              <Link to="/admin/users" className="admin-navigation-card">
                <h2>User Management</h2>
                <p>View users and manage their active or inactive status.</p>
              </Link>

              <Link to="/admin/categories" className="admin-navigation-card">
                <h2>Category Management</h2>
                <p>Create, edit, and remove course categories.</p>
              </Link>

              <Link to="/admin/courses" className="admin-navigation-card">
                <h2>Course Moderation</h2>
                <p>Review submitted courses and publish or reject them.</p>
              </Link>

              <Link
                to="/admin/course-requests"
                className="admin-navigation-card"
              >
                <h2>Course Requests</h2>
                <p>Review Ask Course requests and see aggregated demand.</p>
              </Link>

              <Link to="/admin/proposals" className="admin-navigation-card">
                <h2>Proposal Review</h2>
                <p>Approve, reject, or request revisions on proposals.</p>
              </Link>
            </div>
          </>
        )
      )}
    </section>
  );
};

export default AdminDashboard;
