const lessonService = require("../services/lesson.service");

const VALID_CONTENT_TYPES = [
  "VIDEO",
  "ARTICLE",
  "DOCUMENT",
  "LINK",
];

const createLesson = async (req, res) => {
  try {
    const {
      title,
      description,
      contentType,
      contentUrl,
      resourceUrl,
      durationMinutes,
      isRequired,
      sortOrder,
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required",
      });
    }

    if (
      contentType !== undefined &&
      !VALID_CONTENT_TYPES.includes(contentType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "contentType must be VIDEO, ARTICLE, DOCUMENT, or LINK",
      });
    }

    if (
      sortOrder !== undefined &&
      (!Number.isInteger(sortOrder) || sortOrder < 1)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "sortOrder must be a positive integer",
      });
    }

    if (
      durationMinutes !== undefined &&
      durationMinutes !== null &&
      (!Number.isInteger(durationMinutes) ||
        durationMinutes < 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "durationMinutes must be a non-negative integer",
      });
    }

    if (
      isRequired !== undefined &&
      typeof isRequired !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isRequired must be a boolean",
      });
    }

    const lesson =
      await lessonService.createLesson(
        req.params.sectionId,
        req.user.id,
        req.user.role,
        {
          title: title.trim(),
          description:
            description !== undefined
              ? description?.trim() || null
              : null,
          contentType,
          contentUrl:
            contentUrl !== undefined
              ? contentUrl?.trim() || null
              : null,
          resourceUrl:
            resourceUrl !== undefined
              ? resourceUrl?.trim() || null
              : null,
          durationMinutes,
          isRequired,
          sortOrder,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: {
        lesson,
      },
    });
  } catch (error) {
    console.error("Create lesson error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "This sort order already exists in this section",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const getLessonsBySectionId = async (req, res) => {
  try {
    const lessons =
      await lessonService.getLessonsBySectionId(
        req.params.sectionId
      );

    return res.status(200).json({
      success: true,
      message: "Lessons retrieved successfully",
      data: {
        lessons,
      },
    });
  } catch (error) {
    console.error("Get lessons error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const {
      title,
      description,
      contentType,
      contentUrl,
      resourceUrl,
      durationMinutes,
      isRequired,
      sortOrder,
    } = req.body || {};

    if (
      title === undefined &&
      description === undefined &&
      contentType === undefined &&
      contentUrl === undefined &&
      resourceUrl === undefined &&
      durationMinutes === undefined &&
      isRequired === undefined &&
      sortOrder === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    if (
      title !== undefined &&
      (!title || !title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Lesson title cannot be empty",
      });
    }

    if (
      contentType !== undefined &&
      !VALID_CONTENT_TYPES.includes(contentType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "contentType must be VIDEO, ARTICLE, DOCUMENT, or LINK",
      });
    }

    if (
      sortOrder !== undefined &&
      (!Number.isInteger(sortOrder) || sortOrder < 1)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "sortOrder must be a positive integer",
      });
    }

    if (
      durationMinutes !== undefined &&
      durationMinutes !== null &&
      (!Number.isInteger(durationMinutes) ||
        durationMinutes < 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "durationMinutes must be a non-negative integer",
      });
    }

    if (
      isRequired !== undefined &&
      typeof isRequired !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isRequired must be a boolean",
      });
    }

    const lesson =
      await lessonService.updateLesson(
        req.params.id,
        req.user.id,
        req.user.role,
        {
          title:
            title !== undefined
              ? title.trim()
              : undefined,
          description:
            description !== undefined
              ? description?.trim() || null
              : undefined,
          contentType,
          contentUrl:
            contentUrl !== undefined
              ? contentUrl?.trim() || null
              : undefined,
          resourceUrl:
            resourceUrl !== undefined
              ? resourceUrl?.trim() || null
              : undefined,
          durationMinutes,
          isRequired,
          sortOrder,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: {
        lesson,
      },
    });
  } catch (error) {
    console.error("Update lesson error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "This sort order already exists in this section",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const lesson =
      await lessonService.deleteLesson(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
      data: {
        lesson,
      },
    });
  } catch (error) {
    console.error("Delete lesson error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

module.exports = {
  createLesson,
  getLessonsBySectionId,
  updateLesson,
  deleteLesson,
};