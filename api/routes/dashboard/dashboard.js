const express = require("express");
const router = express.Router();
const { getUserDashboard } = require("../../controllers/dashboard/dashboard");
const userAuth = require("../../middleware/user-auth");

router.route("/dashboard").get(userAuth, getUserDashboard);

module.exports = router;
