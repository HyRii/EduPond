const express = require("express");

const {
  getMyCertificates,
  getCertificateById,
} = require("../controllers/certificate.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const router =
  express.Router();

router.get(
  "/me/certificates",
  authenticate,
  authorize("STUDENT"),
  getMyCertificates
);

router.get(
  "/certificates/:id",
  authenticate,
  authorize(
    "STUDENT",
    "ADMIN"
  ),
  getCertificateById
);

module.exports = router;