const courseService = require("../services/course.service");

const createCourse = async (req, res) => {
  try {
    const {
      categoryId,
      title,
      slug,
      description,
      goal,
      difficulty,
      durationMinutes,
      thumbnailUrl,
      certificateEnabled,
    } = req.body;

    if (!categoryId || !title || !slug) {
      return res.status(400).json({
        success: false,
        message:
          "Category ID, title and slug are required",
      });
    }

    const course =
      await courseService.createCourse({
        instructorId: req.user.id,
        categoryId,
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        goal: goal?.trim() || null,
        difficulty,
        durationMinutes,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        certificateEnabled,
      });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Create course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses =
      await courseService.getCourses(
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: {
        courses,
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course =
      await courseService.getCourseById(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const {
      categoryId,
      title,
      slug,
      description,
      goal,
      difficulty,
      durationMinutes,
      thumbnailUrl,
      certificateEnabled,
    } = req.body || {};

    if (
      categoryId === undefined &&
      title === undefined &&
      slug === undefined &&
      description === undefined &&
      goal === undefined &&
      difficulty === undefined &&
      durationMinutes === undefined &&
      thumbnailUrl === undefined &&
      certificateEnabled === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    const course =
      await courseService.updateCourse(
        req.params.id,
        req.user.id,
        req.user.role,
        {
          categoryId,
          title: title?.trim(),
          slug: slug?.trim().toLowerCase(),
          description:
            description !== undefined
              ? description?.trim() || null
              : undefined,
          goal:
            goal !== undefined
              ? goal?.trim() || null
              : undefined,
          difficulty,
          durationMinutes,
          thumbnailUrl:
            thumbnailUrl !== undefined
              ? thumbnailUrl?.trim() || null
              : undefined,
          certificateEnabled,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Update course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course =
      await courseService.deleteCourse(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Delete course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const submitCourse = async (req, res) => {
  try {
    const course =
      await courseService.submitCourse(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Course submitted for review",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Submit course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const publishCourse = async (req, res) => {
  try {
    const course =
      await courseService.publishCourse(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Course published successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Publish course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const rejectCourse = async (req, res) => {
  try {
    const course =
      await courseService.rejectCourse(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Course rejected successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Reject course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const archiveCourse = async (req, res) => {
  try {
    const course =
      await courseService.archiveCourse(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Course archived successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Archive course error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  submitCourse,
  publishCourse,
  rejectCourse,
  archiveCourse,
};