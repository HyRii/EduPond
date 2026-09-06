import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";

const InstructorLayout = () => {
  return (
    <div className="instructor-layout">

      <aside className="instructor-sidebar">

        <div className="instructor-brand">
          <h1>EduPond</h1>

          <p>Instructor Panel</p>
        </div>

        <nav className="instructor-navigation">

          <NavLink
            to="/instructor"
            end
            className={({ isActive }) =>
              isActive
                ? "instructor-nav-link active"
                : "instructor-nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/instructor/courses"
            className={({ isActive }) =>
              isActive
                ? "instructor-nav-link active"
                : "instructor-nav-link"
            }
          >
            My Courses
          </NavLink>

          {/* EDITED (Phase 4): Ask Course demand is now available to instructors. */}
          <NavLink to="/instructor/course-requests"
            className={({ isActive }) => isActive ? "instructor-nav-link active" : "instructor-nav-link"}>
            Course Requests
          </NavLink>

          {/* EDITED (Phase 4): Proposal workflow is now available. */}
          <NavLink to="/instructor/proposals"
            className={({ isActive }) => isActive ? "instructor-nav-link active" : "instructor-nav-link"}>
            Proposals
          </NavLink>

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