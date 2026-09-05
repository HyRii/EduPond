import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";

const AdminLayout = () => (
  <div className="app-layout">
    <aside className="sidebar">
      <h1>EduPond</h1>
      <p>Admin</p>
      <nav className="sidebar-nav">
        <NavLink to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/categories">Categories</NavLink>
        <NavLink to="/admin/courses">Courses</NavLink>
        <NavLink to="/admin/course-requests">Course Requests</NavLink>
        <NavLink to="/admin/proposals">Proposals</NavLink>
      </nav>
      <LogoutButton />
    </aside>
    <main className="app-content"><Outlet /></main>
  </div>
);

export default AdminLayout;
