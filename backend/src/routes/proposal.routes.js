// NEW FILE (Phase 4): Instructor proposal and admin review routes.
const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const controller = require("../controllers/proposal.controller");

const router = express.Router();

router.post("/course-proposals", authenticate, authorize("INSTRUCTOR"), controller.createProposal);
router.put("/course-proposals/:id", authenticate, authorize("INSTRUCTOR"), controller.updateProposal);
router.post("/course-proposals/:id/sections", authenticate, authorize("INSTRUCTOR"), controller.addSection);
router.post(
  "/course-proposals/:id/sections/:sectionId/lessons",
  authenticate, authorize("INSTRUCTOR"), controller.addLesson
);
router.post("/course-proposals/:id/submit", authenticate, authorize("INSTRUCTOR"), controller.submitProposal);
router.get("/course-proposals/mine", authenticate, authorize("INSTRUCTOR"), controller.getMyProposals);
router.get("/course-proposals/:id", authenticate, authorize("INSTRUCTOR"), controller.getMyProposalDetail);


router.get("/admin/course-proposals", authenticate, authorize("ADMIN"), controller.listProposals);
router.get("/admin/course-proposals/:id", authenticate, authorize("ADMIN"), controller.getProposalDetail);
router.patch("/admin/course-proposals/:id/review", authenticate, authorize("ADMIN"), controller.reviewProposal);
router.post("/admin/course-proposals/:id/convert", authenticate, authorize("ADMIN"), controller.convertProposal);

module.exports = router;
