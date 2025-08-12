import express from "express";
const router = express.Router();
import {
  sendSignupOtp,
  verifySignupOtp,
} from "../../controllers/auth/signup.js";
import { Login } from "../../controllers/auth/login.js";
import { UserProfile, updateUserProfile, deleteUserProfile } from "../../controllers/auth/user.js";
import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import userAuth from "../../middleware/user-auth.js";

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

export default router;