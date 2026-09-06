const express = require("express");

const {
  completeLesson,
} = require("../controllers/progress.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const router =
  express.Router();

router.post(
  "/lessons/:id/complete",
  authenticate,
  authorize("STUDENT"),
  completeLesson
);

module.exports = router;