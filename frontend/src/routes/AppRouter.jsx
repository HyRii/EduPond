import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import RegisterStudent from "../pages/auth/RegisterStudent";
import RegisterInstructor from "../pages/auth/RegisterInstructor";

import CourseCatalog from "../pages/student/CourseCatalog";
import CourseDetail from "../pages/student/CourseDetail";
import MyCourses from "../pages/student/MyCourses";
// NEW (Phase 3B): CourseLearn.jsx already existed (built for the
// lesson-progress work) but was never imported/wired into the router
// below -- the route still rendered a "Phase 2" placeholder instead
// of this component. Fixed below.
import CourseLearn from "../pages/student/CourseLearn";
// EDITED (Phase 3C): QuizAttempt.jsx already existed (and CourseLearn.jsx's
// "Take Quiz" button already linked to /student/quizzes/:quizId/:enrollmentId)
// but the route itself was never registered below, so that link 404'd via
// the catch-all route. Added here together with the matching <Route>.
import QuizAttempt from "../pages/student/QuizAttempt";
import Certificates from "../pages/student/Certificates";
import CertificateDetail from "../pages/student/CertificateDetail";

import StudentLayout from "../layouts/StudentLayout";
import InstructorLayout from "../layouts/InstructorLayout";
import AdminLayout from "../layouts/AdminLayout";

import LogoutButton from "../components/common/LogoutButton";

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

const SimpleDashboard = ({ role }) => (
  <section>
    <h1>{role} Dashboard</h1>
    <p>
      The role-specific dashboard metrics will be completed in Phase 5.
    </p>

    <LogoutButton />
  </section>
);

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* =========================
          PUBLIC
      ========================= */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
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
          element={
            <SimpleDashboard role="Student" />
          }
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

        {/*
          EDITED (Phase 3B): this route used to render an inline
          placeholder ("Lesson progress will be implemented in
          Phase 2.") even though CourseLearn.jsx -- the full lesson
          player with progress tracking and, as of this phase, the
          full-screen reader -- already existed and was already being
          linked to from MyCourses.jsx. It just wasn't wired in here.
        */}
        <Route
          path="my-courses/:enrollmentId"
          element={<CourseLearn />}
        />

        {/*
          NEW (Phase 3C): matches the URL CourseLearn.jsx already builds
          (`/student/quizzes/${quiz.id}/${enrollmentId}`) for its
          "Take Quiz" button. QuizAttempt.jsx reads quizId/enrollmentId
          from useParams() using these exact names.
        */}
        <Route
          path="quizzes/:quizId/:enrollmentId"
          element={<QuizAttempt />}
        />

        <Route path="course-requests" element={<AskCourse />} />

        {/* EDITED (Phase 3D): Certificate pages now use the generated JPEG. */}
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
          element={
            <SimpleDashboard role="Instructor" />
          }
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
          element={
            <SimpleDashboard role="Admin" />
          }
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