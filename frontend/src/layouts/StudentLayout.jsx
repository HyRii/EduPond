import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";

const StudentLayout = () => {
  return (
    <div className="student-layout">

      <aside className="student-sidebar">

        <div className="student-brand">
          <h1>EduPond</h1>
          <p>Student Panel</p>
        </div>

        <nav className="student-navigation">

          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/student/courses"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
          >
            Browse Courses
          </NavLink>

          <NavLink
            to="/student/my-courses"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
          >
            My Courses
          </NavLink>

          <span className="student-nav-link disabled">
            Ask Course
          </span>

          {/* EDITED (Phase 3D): Certificates are now available. */}
          <NavLink
            to="/student/certificates"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
          >
            Certificates
          </NavLink>

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