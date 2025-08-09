import express from "express";
const router = express.Router();
import { adminLogin, adminRegister } from "../../controllers/admin/auth.js";
import {
  createJobRole,
  getJobRoles,
  getJobRoleById,
  updateJobRole,
  deleteJobRole,
} from "../../controllers/admin/job-roles.js";
import {
  createJobPosition,
  getJobPositions,
  getJobPositionById,
  updateJobPosition,
  deleteJobPosition,
} from "../../controllers/admin/job-positions.js";
import adminAuth from "../../middleware/admin-auth.js";

router.route("/login").post(adminLogin);
router.route("/register").post(adminRegister);

// Job Roles routes
router
  .route("/job-roles")
  .post(adminAuth, createJobRole)
  .get(adminAuth, getJobRoles);

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

export default router;
