import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";


import Login from "../pages/auth/Login";
import LogoutButton from "../components/common/LogoutButton";
import RegisterStudent from "../pages/auth/RegisterStudent";
import RegisterInstructor from "../pages/auth/RegisterInstructor";

//COURSE//
import CourseCatalog from "../pages/student/CourseCatalog";
import CourseDetail from "../pages/student/CourseDetail";
import MyCourses from "../pages/student/MyCourses";
import CourseLearn from "../pages/student/CourseLearn";

//ADMIN
import AdminLayout from "../layouts/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import UserManagement from "../pages/admin/UserManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import CourseModeration from "../pages/admin/CourseModeration";

//INSTRUCTOR
import InstructorLayout from "../layouts/InstructorLayout";
import InstructorHome from "../pages/instructor/InstructorHome";
import InstructorCourses from "../pages/instructor/InstructorCourses";
import CourseForm from "../pages/instructor/CourseForm";
import CourseBuilder from "../pages/instructor/CourseBuilder";

//STUDENT
import StudentLayout from "../layouts/StudentLayout";
import StudentHome from "../pages/student/StudentHome";

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
    <ProtectedRoute
      allowedRoles={["STUDENT"]}
    >
      <StudentLayout />
    </ProtectedRoute>
  }
>
  <Route
    index
    element={<StudentHome />}
  />

  <Route
    path="courses"
    element={<CourseCatalog />}
  />

  <Route
    path="courses/:id"
    element={<CourseDetail />}
  />

  <Route
    path="my-courses"
    element={<MyCourses />}
  />

  <Route
    path="my-courses/:enrollmentId"
    element={<CourseLearn />}
  />

  {/* Future Phase 4 */}
  <Route
    path="course-requests"
    element={
      <div className="simple-page">
        <h1>Ask Course</h1>

        <p>
          Ask Course will be implemented
          in Phase 4.
        </p>
      </div>
    }
  />

  {/* Future Phase 3 */}
  <Route
    path="certificates"
    element={
      <div className="simple-page">
        <h1>Certificates</h1>

        <p>
          Certificates will be implemented
          in Phase 3.
        </p>
      </div>
    }
  />

  

</Route>

{/* ==================== */}
{/* INSTRUCTOR */}
{/* ==================== */}

<Route
  path="/instructor"
  element={
    <ProtectedRoute
      allowedRoles={["INSTRUCTOR"]}
    >
      <InstructorLayout />
    </ProtectedRoute>
  }
>
  <Route
    index
    element={<InstructorHome />}
  />

  <Route
    path="courses"
    element={<InstructorCourses />}
  />

  <Route
    path="courses/new"
    element={<CourseForm />}
  />

  <Route
    path="courses/:id/edit"
    element={<CourseForm />}
  />

  <Route
    path="courses/:id/builder"
    element={<CourseBuilder />}
  />
</Route>

{/* ==================== */}
{/* ADMIN */}
{/* ==================== */}

<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route
    index
    element={<AdminHome />}
  />

  <Route
    path="users"
    element={<UserManagement />}
  />

  <Route
    path="categories"
    element={<CategoryManagement />}
  />

  <Route
    path="courses"
    element={<CourseModeration />}
  />

  {/* Fase 4 */}
  <Route
    path="course-requests"
    element={
      <div className="simple-page">
        <h1>Course Requests</h1>
        <p>
          Ask Course administration will be implemented
          in Phase 4.
        </p>
      </div>
    }
  />

  {/* Fase 4 */}
  <Route
    path="proposals"
    element={
      <div className="simple-page">
        <h1>Instructor Proposals</h1>
        <p>
          Proposal moderation will be implemented
          in Phase 4.
        </p>
      </div>
    }
  />
</Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;