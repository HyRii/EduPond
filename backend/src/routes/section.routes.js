const express = require("express");

const {
  createSection,
  getSectionsByCourseId,
  updateSection,
  deleteSection,
} = require("../controllers/section.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/courses/:courseId/sections",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  createSection
);

router.get(
  "/courses/:courseId/sections",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR", "STUDENT"),
  getSectionsByCourseId
);

router.put(
  "/sections/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  updateSection
);

router.delete(
  "/sections/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  deleteSection
);

module.exports = router;