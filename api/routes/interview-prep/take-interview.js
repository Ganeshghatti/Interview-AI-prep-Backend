import express from "express";
const router = express.Router();
import {
  getAllActiveJobRoles,
  startInterviewPrep,
  getInterviewPrepById,
  inprogressInterview,
  manuallyEndInterview
} from "../../controllers/interview-prep/take-interview.js";
import userAuth from "../../middleware/user-auth.js";

router.route("/get-active-job-roles").get(userAuth, getAllActiveJobRoles);
router
  .route("/start/job-role/:jobRoleId/user/:userId")
  .post(userAuth, startInterviewPrep);

router.route("/interview/:interviewId").get(userAuth, getInterviewPrepById);
router.route("/interview/:interviewId").post(userAuth, inprogressInterview);
router.route("/interview/:interviewId/end").post(userAuth, manuallyEndInterview);

export default router;
