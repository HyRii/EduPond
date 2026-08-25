const express = require("express");

const { registerStudent,
        registerInstructor,
        login,
        getCurrentUser,
        getAdminTest,
 } = require("../controllers/auth.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/register/instructor", registerInstructor);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  getAdminTest
);

module.exports = router;