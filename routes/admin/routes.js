const express = require("express");
const router = express.Router();
const { adminLogin, adminRegister } = require("../../controllers/admin/auth");
const {
  createJobRole,
  getJobRoles,
  getJobRoleById,
  updateJobRole,
  deleteJobRole,
} = require("../../controllers/admin/job-roles");
const {
  createJobPosition,
  getJobPositions,
  getJobPositionById,
  updateJobPosition,
  deleteJobPosition,
} = require("../../controllers/admin/job-positions");
const adminAuth = require("../../middleware/admin-auth");

router.route("/login").post(adminLogin);
router.route("/register").post(adminRegister);

// Job Roles routes
router
  .route("/job-roles")
  .post(adminAuth, createJobRole)
  .get(adminAuth, getJobRoles)

router.route("/job-roles/:id").get(adminAuth, getJobRoleById);
router.route("/job-roles/:id").put(adminAuth, updateJobRole);
router.route("/job-roles/:id").delete(adminAuth, deleteJobRole);

// Job Positions routes
router
  .route("/job-positions")
  .post(adminAuth, createJobPosition)
  .get(adminAuth, getJobPositions);

router
  .route("/job-positions/:id")
  .get(adminAuth, getJobPositionById)
  .put(adminAuth, updateJobPosition)
  .delete(adminAuth, deleteJobPosition);

module.exports = router;
