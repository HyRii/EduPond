const sectionService = require("../services/section.service");

const createSection = async (req, res) => {
  try {
    const { title, description, sortOrder } =
        req.body || {};

    if (!title || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Section title is required",
        });
    }

    if (
        sortOrder !== undefined &&
        (!Number.isInteger(sortOrder) || sortOrder < 1) 
    ) {
        return res.status(400).json({
        success: false,
        message: "sortOrder must be a positive integer",
        });
    }

    const section =
      await sectionService.createSection(
        req.params.courseId,
        req.user.id,
        req.user.role,
        {
          title: title.trim(),
          description:
            description !== undefined
              ? description?.trim() || null
              : null,
          sortOrder,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: {
        section,
      },
    });
  } catch (error) {
    console.error("Create section error:", error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
         success: false,
         message:
            "This sort order already exists in this course",
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

const getSectionsByCourseId = async (req, res) => {
  try {
    const sections =
      await sectionService.getSectionsByCourseId(
        req.params.courseId
      );

    return res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      data: {
        sections,
      },
    });
  } catch (error) {
    console.error("Get sections error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const updateSection = async (req, res) => {
  try {
    const {
      title,
      description,
      sortOrder,
    } = req.body || {};

    if (
      title === undefined &&
      description === undefined &&
      sortOrder === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    if (
        sortOrder !== undefined &&
        (!Number.isInteger(sortOrder) || sortOrder < 1)
    ) {
         return res.status(400).json({
             success: false,
             message: "sortOrder must be a positive integer",
        }); 
    }

    const section =
      await sectionService.updateSection(
        req.params.id,
        req.user.id,
        req.user.role,
        {
          title:
            title !== undefined
              ? title?.trim()
              : undefined,
          description:
            description !== undefined
              ? description?.trim() || null
              : undefined,
          sortOrder,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: {
        section,
      },
    });
  } catch (error) {  
    console.error("Update section error:", error);

    if (error.code === "ER_DUP_ENTRY") {
     return res.status(409).json({
        success: false,
        message:
             "This sort order already exists in this course",
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

const deleteSection = async (req, res) => {
  try {
    const section =
      await sectionService.deleteSection(
        req.params.id,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: {
        section,
      },
    });
  } catch (error) {
    console.error("Delete section error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

module.exports = {
  createSection,
  getSectionsByCourseId,
  updateSection,
  deleteSection,
};