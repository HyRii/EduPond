const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const controller = require("../controllers/dashboard.controller");

const router = express.Router();

router.get(
  "/dashboard/admin",
  authenticate,
  authorize("ADMIN"),
  controller.getAdminDashboard
);

router.get(
  "/dashboard/instructor",
  authenticate,
  authorize("INSTRUCTOR"),
  controller.getInstructorDashboard
);

router.get(
  "/dashboard/student",
  authenticate,
  authorize("STUDENT"),
  controller.getStudentDashboard
);

module.exports = router;
