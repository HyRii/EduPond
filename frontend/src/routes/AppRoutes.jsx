import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import CourseCatalog from "../pages/student/CourseCatalog";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route
          path="/"
          element={
            <div>
              <h1>EduPond</h1>
              <p>A pond of knowledge.</p>
              <p>Full-Stack Education Platform.</p>
            </div>
          }
        />

        <Route
          path="/login"
          element={<h1>Login</h1>}
        />

        <Route
          path="/unauthorized"
          element={<h1>Unauthorized</h1>}
        />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <h1>Student Dashboard</h1>
            </ProtectedRoute>
          }
        />

        {/* Instructor */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
              <h1>Instructor Dashboard</h1>
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <h1>Admin Dashboard</h1>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

<Route
  path="/courses"
  element={
    <ProtectedRoute
      allowedRoles={["STUDENT"]}
    >
      <CourseCatalog />
    </ProtectedRoute>
  }
/>

export default AppRouter;