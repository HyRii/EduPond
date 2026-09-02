const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
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