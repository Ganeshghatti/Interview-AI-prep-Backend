const express = require("express");
const router = express.Router();
const { sendSignupOtp, verifySignupOtp } = require("../controllers/signup");
const { loginWithPassword } = require("../controllers/login");

router.post("/signup/send-otp", sendSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/login", loginWithPassword);

module.exports = router;
