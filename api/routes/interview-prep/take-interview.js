const express = require("express");
const router = express.Router();
const {
  getAllActiveJobRoles,
} = require("../../controllers/interview-prep/take-interview");
const userAuth = require("../../middleware/user-auth");

router.route("/get-active-job-roles").get(userAuth, getAllActiveJobRoles);

module.exports = router;
