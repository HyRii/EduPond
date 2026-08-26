const categoryService = require("../services/category.service");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await categoryService.createCategory({
      name: name.trim(),
      description: description?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories =
      await categoryService.getCategories();

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category =
      await categoryService.getCategoryById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
    } = req.body;

    const category =
      await categoryService.updateCategory(
        req.params.id,
        {
          name: name?.trim(),
          description:
            description !== undefined
              ? description?.trim() || null
              : undefined,
          status,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category =
      await categoryService.deleteCategory(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Internal server error",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};