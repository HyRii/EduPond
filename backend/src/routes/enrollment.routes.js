const express = require("express");

const {
  enrollCourse,
  getMyEnrollments,
  getEnrollmentById,
} = require("../controllers/enrollment.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/courses/:courseId/enroll",
  authenticate,
  authorize("STUDENT"),
  enrollCourse
);

router.get(
  "/me/enrollments",
  authenticate,
  authorize("STUDENT"),
  getMyEnrollments
);

router.get(
  "/enrollments/:id",
  authenticate,
  authorize("STUDENT"),
  getEnrollmentById
);

module.exports = router;