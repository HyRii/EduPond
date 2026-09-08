const quizService = require("../services/quiz.service");

const createQuiz = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      description,
      passingScore,
    } = req.body || {};

    if (
      !title ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    if (
      passingScore !== undefined &&
      (
        typeof passingScore !== "number" ||
        passingScore < 0 ||
        passingScore > 100
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "passingScore must be a number between 0 and 100",
      });
    }

    const quiz =
      await quizService.createQuiz(
        req.params.lessonId,
        req.user.id,
        {
          title: title.trim(),
          description:
            description !== undefined
              ? description?.trim() || null
              : null,
          passingScore,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: {
        quiz,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (
  req,
  res,
  next
) => {
  try {
    const {
      questionText,
      questionType,
      points,
      sortOrder,
      options,
    } = req.body || {};

    if (
      !questionText ||
      !questionText.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Question text is required",
      });
    }

    if (
      questionType !== undefined &&
      questionType !==
        "SINGLE_CHOICE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only SINGLE_CHOICE questions are supported",
      });
    }

    if (
      points !== undefined &&
      (
        typeof points !== "number" ||
        points <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "points must be a positive number",
      });
    }

    if (
      sortOrder !== undefined &&
      (
        !Number.isInteger(sortOrder) ||
        sortOrder < 1
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "sortOrder must be a positive integer",
      });
    }

    if (!Array.isArray(options)) {
      return res.status(400).json({
        success: false,
        message:
          "options must be an array",
      });
    }

    if (options.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "At least 2 options are required",
      });
    }

    for (const option of options) {
      if (
        !option ||
        !option.optionText ||
        !option.optionText.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each option must have optionText",
        });
      }

      if (
        typeof option.isCorrect !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each option must have boolean isCorrect",
        });
      }
    }

    const question =
      await quizService.addQuestion(
        req.params.quizId,
        req.user.id,
        {
          questionText:
            questionText.trim(),
          questionType:
            questionType ||
            "SINGLE_CHOICE",
          points,
          sortOrder,
          options: options.map(
            (option) => ({
              optionText:
                option.optionText.trim(),
              isCorrect:
                option.isCorrect,
              sortOrder:
                option.sortOrder,
            })
          ),
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Question created successfully",
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createOption = async (
  req,
  res,
  next
) => {
  try {
    const {
      optionText,
      isCorrect,
      sortOrder,
    } = req.body || {};

    if (
      !optionText ||
      !optionText.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Option text is required",
      });
    }

    if (
      typeof isCorrect !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isCorrect must be a boolean",
      });
    }

    const option =
      await quizService.addOption(
        req.params.questionId,
        req.user.id,
        {
          optionText:
            optionText.trim(),
          isCorrect,
          sortOrder,
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Option created successfully",
      data: {
        option,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getQuiz = async (
  req,
  res,
  next
) => {
  try {
    const quiz =
      await quizService.getQuizById(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message:
        "Quiz retrieved successfully",
      data: {
        quiz,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getQuizForLesson = async (
  req,
  res,
  next
) => {
  try {
    const quiz =
      await quizService.getQuizByLessonId(
        req.params.lessonId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message:
        "Quiz retrieved successfully",
      data: {
        quiz,
      },
    });
  } catch (error) {
    next(error);
  }
};

// NEW (Phase 3D): Student endpoint for checking the one-hour retry cooldown.
const getRetryStatus = async (req, res, next) => {
  try {
    const enrollmentId = Number(req.query.enrollmentId);

    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "enrollmentId query parameter is required",
      });
    }

    const status = await quizService.getRetryStatus(
      req.params.id,
      enrollmentId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Quiz retry status retrieved successfully",
      data: {
        retry: status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const submitAttempt = async (
  req,
  res,
  next
) => {
  try {
    const {
      enrollmentId,
      answers,
    } = req.body || {};

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message:
          "enrollmentId is required",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message:
          "answers must be an array",
      });
    }

    const attempt =
      await quizService.submitAttempt(
        req.params.id,
        enrollmentId,
        req.user.id,
        answers
      );

    return res.status(201).json({
      success: true,
      message:
        attempt.passed
          ? "Quiz passed"
          : "Quiz submitted",
      data: {
        attempt,
      },
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({
        success: false,
        message: error.message,
        errors: {
          retryAvailableAt: error.retryAvailableAt,
        },
        retryAvailableAt: error.retryAvailableAt,
      });
    }

    next(error);
  }
};

const getAttempts = async (
  req,
  res,
  next
) => {
  try {
    const attempts =
      await quizService.getAttempts(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message:
        "Quiz attempts retrieved successfully",
      data: {
        attempts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  createQuestion,
  createOption,
  getQuiz,
  getQuizForLesson,
  getRetryStatus,
  submitAttempt,
  getAttempts,
};