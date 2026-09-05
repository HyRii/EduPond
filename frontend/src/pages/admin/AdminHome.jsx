import { Link } from "react-router-dom";

const AdminHome = () => {
  return (
    <section className="admin-page">

      <div className="admin-page-header">
        <div>
          <p className="page-eyebrow">ADMIN PANEL</p>

          <h1>Admin Dashboard</h1>

          <p className="page-description">
            Manage users, categories, and course moderation.
          </p>
        </div>
      </div>

      <div className="admin-card-grid">

        <Link
          to="/admin/users"
          className="admin-navigation-card"
        >
          <h2>User Management</h2>

          <p>
            View users and manage their active or inactive status.
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="admin-navigation-card"
        >
          <h2>Category Management</h2>

          <p>
            Create, edit, and remove course categories.
          </p>
        </Link>

        <Link
          to="/admin/courses"
          className="admin-navigation-card"
        >
          <h2>Course Moderation</h2>

          <p>
            Review submitted courses and publish or reject them.
          </p>
        </Link>

      </div>

    </section>
  );
};

export default AdminHome;