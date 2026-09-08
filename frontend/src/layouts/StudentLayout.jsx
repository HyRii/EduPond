import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";
import PondMark from "../components/common/PondMark";

const NAV_ITEMS = [
  { to: "/student", label: "Dashboard", end: true },
  { to: "/student/courses", label: "Browse Courses" },
  { to: "/student/my-courses", label: "My Courses" },
  { to: "/student/course-requests", label: "Ask Course" },
  { to: "/student/certificates", label: "Certificates" },
];

const StudentLayout = () => {
  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div className="student-brand">
          <PondMark size={38} />
          <div>
            <h1>EduPond</h1>
            <p>Student Panel</p>
          </div>
        </div>

        <nav className="student-navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "student-nav-link active" : "student-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="student-sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
