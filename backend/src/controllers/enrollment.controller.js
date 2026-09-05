const enrollmentService = require("../services/enrollment.service");

const enrollCourse = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const enrollment =
      await enrollmentService.enrollCourse(
        studentId,
        courseId
      );

    res.status(201).json({
      success: true,
      message: "Course enrolled successfully",
      data: {
        enrollment,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyEnrollments = async (
  req,
  res,
  next
) => {
  try {
    const studentId = req.user.id;

    const enrollments =
      await enrollmentService.getMyEnrollments(
        studentId
      );

    res.status(200).json({
      success: true,
      message: "Enrollments retrieved successfully",
      data: {
        enrollments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEnrollmentById = async (
  req,
  res,
  next
) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const enrollment =
      await enrollmentService.getEnrollmentById(
        id,
        studentId
      );

    res.status(200).json({
      success: true,
      message: "Enrollment retrieved successfully",
      data: {
        enrollment,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
  getEnrollmentById,
};