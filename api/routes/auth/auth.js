const express = require("express");
const router = express.Router();
const {
  sendSignupOtp,
  verifySignupOtp,
} = require("../../controllers/auth/signup");
const { Login } = require("../../controllers/auth/login");
const { UserProfile, updateUserProfile, deleteUserProfile } = require("../../controllers/auth/user");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const userAuth = require("../../middleware/user-auth");

// OTP-specific rate limiting with enhanced rules to prevent abuse
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  limit: 3, // Allow up to 3 attempts per hour
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many OTP requests. Please try again after 1 hour.",
  skipSuccessfulRequests: false, // Count successful requests against the limit
  keyGenerator: (req) => {
    // Use both IP and phone number (from request body) to create the key
    // This prevents attackers from using multiple phone numbers from the same IP
    return `${ipKeyGenerator(req)}-${req.body.phone || "unknown"}`;
  },
});

router.route("/signup/send-otp").post(otpLimiter, sendSignupOtp);
router.route("/signup/verify-otp").post(verifySignupOtp);
router.route("/login").post(Login);
router
  .route("/user/profile")
    .get(userAuth, UserProfile)
    .put(userAuth, updateUserProfile)
    .delete(userAuth, deleteUserProfile);
module.exports = router;
