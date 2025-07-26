const express = require("express");
const router = express.Router();
const {
  getAllActiveJobPositions,
} = require("../../controllers/apply-jobs/get-jobs");
const userAuth = require("../../middleware/user-auth");

router.route("/get-active-job-positions").get(userAuth, getAllActiveJobPositions);

module.exports = router;
