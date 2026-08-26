const express = require("express");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR", "STUDENT"),
  getCategories
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR", "STUDENT"),
  getCategoryById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createCategory
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteCategory
);

module.exports = router;