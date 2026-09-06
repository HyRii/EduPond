const progressService =
  require("../services/progress.service");

const completeLesson = async (
  req,
  res,
  next
) => {
  try {

    const {
      id: lessonId,
    } = req.params;

    const {
      enrollmentId,
    } = req.body || {};

    if (!enrollmentId) {

      return res.status(400).json({
        success: false,
        message:
          "enrollmentId is required",
      });

    }

    const progress =
      await progressService.markLessonComplete(
        enrollmentId,
        lessonId,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Lesson completed successfully",
      data: {
        progress,
      },
    });

  } catch (error) {

    return next(error);

  }
};

module.exports = {
  completeLesson,
};