import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";

const AdminLayout = () => {
  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1>EduPond</h1>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-navigation">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Categories
          </NavLink>

          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Courses
          </NavLink>

          <NavLink
            to="/admin/course-requests"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Course Requests
          </NavLink>

          <NavLink
            to="/admin/proposals"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Proposals
          </NavLink>

        </nav>

        <div className="admin-sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;