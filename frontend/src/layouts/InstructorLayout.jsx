import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";
import PondMark from "../components/common/PondMark";

const NAV_ITEMS = [
  { to: "/instructor", label: "Dashboard", end: true },
  { to: "/instructor/courses", label: "My Courses" },
  { to: "/instructor/course-requests", label: "Course Requests" },
  { to: "/instructor/proposals", label: "Proposals" },
];

const InstructorLayout = () => {
  return (
    <div className="instructor-layout">
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <PondMark size={38} />
          <div>
            <h1>EduPond</h1>
            <p>Instructor Panel</p>
          </div>
        </div>

        <nav className="instructor-navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "instructor-nav-link active" : "instructor-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="instructor-sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      <main className="instructor-content">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorLayout;
