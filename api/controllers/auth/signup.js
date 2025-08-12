import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import OTP from "../../models/otp.js";
import validator from "validator";
import { sendSMS } from "../../utils/sms.js";

export const sendSignupOtp = async (req, res) => {
  try {
    const { phone, email, name, password } = req.body;

    if (!phone || !email || !name || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }

    if (!phone || !validator.isMobilePhone(phone, "en-IN")) {
      return res
        .status(400)
        .json({ success: false, msg: "Valid phone number is required" });
    }

    if (!email || !validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, msg: "Valid email is required" });
    }

    const existingUserByPhone = await User.findOne({ phone });
    const existingUserByEmail = await User.findOne({ email });
    
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        msg: "User already exists with this phone number",
      });
    }
    
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        msg: "User already exists with this email address",
      });
    }

    const isOTPsent = await OTP.findOne({ phone });
    if (isOTPsent && isOTPsent.createdAt > new Date(Date.now() - 60 * 1000)) {
      return res.status(400).json({
        success: false,
        msg: "OTP already sent. Please wait for 1 minute before requesting another",
      });
    }
    if (isOTPsent && isOTPsent.createdAt < new Date(Date.now() - 60 * 1000)) {
      await OTP.deleteOne({ phone });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendSMS(`+91${phone}`, otp);
    await OTP.create({ phone, otp });

    return res.json({ success: true, msg: "OTP sent successfully" });
  } catch (err) {
    console.error("Error in sendSignupOtp:", err.message);
    res.status(500).json({ success: false, msg: err.message });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { phone, otp, password, name, email } = req.body;

    if (!phone || !otp || !password || !name || !email) {
      return res
        .status(400)
        .json({ success: false, msg: "Phone, OTP, and password are required" });
    }

    const record = await OTP.findOne({ phone });
    if (record.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired OTP" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      phone,
      password: hashedPassword,
      name,
      email,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    await OTP.deleteOne({ phone });
    return res.json({ success: true, token });
  } catch (err) {
    console.error("Error in verifySignupOtp:", err.message);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};
