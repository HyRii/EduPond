const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const controller = require("../controllers/courseRequest.controller");

const router = express.Router();

router.post("/course-requests", authenticate, authorize("STUDENT"), controller.createRequest);
router.get("/course-requests/mine", authenticate, authorize("STUDENT"), controller.getMyRequests);
router.get("/course-requests/available", authenticate, authorize("INSTRUCTOR"), controller.listAvailableRequests);
router.get("/admin/course-requests", authenticate, authorize("ADMIN"), controller.listRequests);
router.get("/admin/course-requests/demand", authenticate, authorize("ADMIN"), controller.getDemand);
router.patch("/admin/course-requests/:id", authenticate, authorize("ADMIN"), controller.reviewRequest);

module.exports = router;
