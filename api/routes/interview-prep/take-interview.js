const express = require("express");
const router = express.Router();
const {
  getAllActiveJobRoles,
  startInterviewPrep,
  getInterviewPrepById,
  inprogressInterview
} = require("../../controllers/interview-prep/take-interview");
const userAuth = require("../../middleware/user-auth");

router.route("/get-active-job-roles").get(userAuth, getAllActiveJobRoles);
router
  .route("/start/job-role/:jobRoleId/user/:userId")
  .post(userAuth, startInterviewPrep);

router.route("/interview/:interviewId").get(userAuth, getInterviewPrepById);
router.route("/interview/:interviewId").post(userAuth, inprogressInterview);

module.exports = router;
