const express = require("express");

const {
  createLesson,
  getLessonsBySectionId,
  updateLesson,
  deleteLesson,
} = require("../controllers/lesson.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/sections/:sectionId/lessons",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  createLesson
);

router.get(
  "/sections/:sectionId/lessons",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR", "STUDENT"),
  getLessonsBySectionId
);

router.put(
  "/lessons/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  updateLesson
);

router.delete(
  "/lessons/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  deleteLesson
);

module.exports = router;