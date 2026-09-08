import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/HomePage";
import Login from "../pages/auth/Login";
import RegisterStudent from "../pages/auth/RegisterStudent";
import RegisterInstructor from "../pages/auth/RegisterInstructor";

import CourseCatalog from "../pages/student/CourseCatalog";
import CourseDetail from "../pages/student/CourseDetail";
import MyCourses from "../pages/student/MyCourses";
import CourseLearn from "../pages/student/CourseLearn";
import QuizAttempt from "../pages/student/QuizAttempt";
import Certificates from "../pages/student/Certificates";
import CertificateDetail from "../pages/student/CertificateDetail";

import StudentLayout from "../layouts/StudentLayout";
import InstructorLayout from "../layouts/InstructorLayout";
import AdminLayout from "../layouts/AdminLayout";


import StudentDashboard from "../pages/student/StudentDashboard";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import InstructorCourses from "../pages/instructor/InstructorCourses";
import CourseForm from "../pages/instructor/CourseForm";
import CourseBuilder from "../pages/instructor/CourseBuilder";
import QuizBuilder from "../pages/instructor/QuizBuilder";
import CourseRequests from "../pages/instructor/CourseRequests";
import ProposalForm from "../pages/instructor/ProposalForm";
import MyProposals from "../pages/instructor/MyProposals";

import UserManagement from "../pages/admin/UserManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import CourseModeration from "../pages/admin/CourseModeration";
import AskCourse from "../pages/student/AskCourse";
import CourseRequestReview from "../pages/admin/CourseRequestReview";
import ProposalReview from "../pages/admin/ProposalReview";



const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* =========================
          PUBLIC
      ========================= */}
      <Route
        path="/"
        element={<HomePage />}
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
          <section className="simple-page">
            <h1>Unauthorized</h1>

            <p>
              You don't have permission to access this page.
            </p>
          </section>
        }
      />

      {/* =========================
          STUDENT
      ========================= */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<StudentDashboard />}
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

        <Route
          path="quizzes/:quizId/:enrollmentId"
          element={<QuizAttempt />}
        />

        <Route path="course-requests" element={<AskCourse />} />


        <Route
          path="certificates"
          element={<Certificates />}
        />

        <Route
          path="certificates/:id"
          element={<CertificateDetail />}
        />
      </Route>

      {/* =========================
          INSTRUCTOR
      ========================= */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<InstructorDashboard />}
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

        {/* COURSE BUILDER */}
        <Route
          path="courses/:id/builder"
          element={<CourseBuilder />}
        />

        {/* QUIZ BUILDER */}
        <Route
          path="lessons/:lessonId/quiz"
          element={<QuizBuilder />}
        />

        <Route path="course-requests" element={<CourseRequests />} />
        <Route path="proposals" element={<MyProposals />} />
        <Route path="proposals/new" element={<ProposalForm />} />
        <Route path="proposals/:id/edit" element={<ProposalForm />} />
      </Route>

      {/* =========================
          ADMIN
      ========================= */}
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
          element={<AdminDashboard />}
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

        <Route path="course-requests" element={<CourseRequestReview />} />
        <Route path="proposals" element={<ProposalReview />} />
      </Route>

      {/* =========================
          FALLBACK
      ========================= */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;