const express = require("express");

const {
  createQuiz,
  createQuestion,
  createOption,
  getQuiz,
  getQuizForLesson,
  submitAttempt,
  getAttempts,
} = require("../controllers/quiz.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/lessons/:lessonId/quiz",
  authenticate,
  authorize("INSTRUCTOR"),
  createQuiz
);

router.get(
  "/lessons/:lessonId/quiz",
  authenticate,
  authorize(
    "STUDENT",
    "INSTRUCTOR"
  ),
  getQuizForLesson
);

router.post(
  "/quizzes/:quizId/questions",
  authenticate,
  authorize("INSTRUCTOR"),
  createQuestion
);

router.post(
  "/questions/:questionId/options",
  authenticate,
  authorize("INSTRUCTOR"),
  createOption
);

router.get(
  "/quizzes/:id",
  authenticate,
  authorize(
    "STUDENT",
    "INSTRUCTOR"
  ),
  getQuiz
);

router.post(
  "/quizzes/:id/attempts",
  authenticate,
  authorize("STUDENT"),
  submitAttempt
);

router.get(
  "/quizzes/:id/attempts",
  authenticate,
  authorize(
    "STUDENT",
    "INSTRUCTOR"
  ),
  getAttempts
);

module.exports = router;