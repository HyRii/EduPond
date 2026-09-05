const express = require("express");

const {
  getUsers,
  updateUserStatus,
} = require("../controllers/user.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getUsers
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  updateUserStatus
);

module.exports = router;