import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import CourseCatalog from "../pages/student/CourseCatalog";
import Login from "../pages/auth/Login";
import LogoutButton from "../components/common/LogoutButton";
import RegisterStudent from "../pages/auth/RegisterStudent";
import RegisterInstructor from "../pages/auth/RegisterInstructor";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== */}
        {/* PUBLIC */}
        {/* ==================== */}

        <Route
          path="/"
          element={
            <div className="home-page">
              <h1>EduPond</h1>

              <p>
                A pond of knowledge.
              </p>

              <p>
                Full-Stack Education Platform.
              </p>

              <div className="home-actions">
                <a href="/login">
                  Login
                </a>

                <a href="/register/student">
                  Join as Student
                </a>

                <a href="/register/instructor">
                  Become an Instructor
                </a>
              </div>
            </div>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register/student"
          element={<RegisterStudent />}
        />

        <Route
          path="/register/instructor"
          element={<RegisterInstructor />}
        />

        <Route
          path="/unauthorized"
          element={
            <div className="simple-page">
              <h1>Unauthorized</h1>
              <p>
                You don't have permission to access this page.
              </p>
            </div>
          }
        />

{/* ==================== */}
{/* STUDENT */}
{/* ==================== */}

<Route
  path="/student"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="simple-page">
        <h1>Student Dashboard</h1>

        <p>
          Welcome to EduPond, Student.
        </p>
<a href="/student/courses">
  Browse Courses
</a>


        <LogoutButton />
      </div>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/courses"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <CourseCatalog />
      <p>
          Your Courses
        </p>
    </ProtectedRoute>
  }
/>

{/* ==================== */}
{/* INSTRUCTOR */}
{/* ==================== */}

<Route
  path="/instructor"
  element={
    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
      <div className="simple-page">
        <h1>Instructor Dashboard</h1>

        <p>
          Welcome to EduPond, Instructor.
        </p>

        <LogoutButton />
      </div>
    </ProtectedRoute>
  }
/>

{/* ==================== */}
{/* ADMIN */}
{/* ==================== */}

<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="simple-page">
        <h1>Admin Dashboard</h1>

        <p>
          Welcome to EduPond, Admin.
        </p>

        <LogoutButton />
      </div>
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;