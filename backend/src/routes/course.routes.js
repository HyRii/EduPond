const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  submitCourse,
  publishCourse,
  rejectCourse,
  archiveCourse,
} = require("../controllers/course.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR", "STUDENT"),
  getCourses
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR", "STUDENT"),
  getCourseById
);

router.post(
  "/",
  authenticate,
  authorize("INSTRUCTOR"),
  createCourse
);

router.post(
  "/:id/submit",
  authenticate,
  authorize("INSTRUCTOR"),
  submitCourse
);

router.post(
  "/:id/publish",
  authenticate,
  authorize("ADMIN"),
  publishCourse
);

router.post(
  "/:id/reject",
  authenticate,
  authorize("ADMIN"),
  rejectCourse
);

router.post(
  "/:id/archive",
  authenticate,
  authorize("ADMIN"),
  archiveCourse
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  updateCourse
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  deleteCourse
);

module.exports = router;