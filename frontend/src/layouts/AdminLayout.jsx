import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";
import PondMark from "../components/common/PondMark";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/course-requests", label: "Course Requests" },
  { to: "/admin/proposals", label: "Proposals" },
];

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <PondMark size={38} />
          <div>
            <h1>EduPond</h1>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
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
