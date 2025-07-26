const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const OTP = require("../models/otp");
const validator = require("validator");
const sendSMS = require("../utils/sms");

// Signup Step 1: Send OTP
const sendSignupOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !validator.isMobilePhone(phone, "en-IN")) {
            return res.status(400).json({ msg: "Valid phone number is required" });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ phone, otp });
        await sendSMS(`+91${phone}`, otp);

        res.json({ msg: "Signup OTP sent" });
    } catch (err) {
        console.error("Error in sendSignupOtp:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

// Signup Step 2: Verify OTP and Create Account
const verifySignupOtp = async (req, res) => {
    try {
        const { phone, otp, password, name, email } = req.body;

        if (!phone || !otp || !password) {
            return res.status(400).json({ msg: "Phone, OTP, and password are required" });
        }

        const record = await OTP.findOne({ phone }).sort({ createdAt: -1 });
        if (!record || record.otp !== otp) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ phone, password: hashedPassword, name, email });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({ token });
    } catch (err) {
        console.error("Error in verifySignupOtp:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

module.exports = {
    sendSignupOtp,
    verifySignupOtp,
};
