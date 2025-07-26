const User = require("../models/user");
const OTP = require("../models/otp");
const jwt = require("jsonwebtoken");
const sendSMS = require("../utils/sms");
const validator = require("validator");

const sendOtp = async (req, res) => {
    //check frontend get all params
    //check phone and email validity (validator)
    //check phone exists in db

    try {
        const { phone } = req.body;

        // if phone is present
        if (!phone) {
            return res.status(400).json({ msg: "Phone number is required" });
        }

        // phone format
        if (!validator.isMobilePhone(phone, "en-IN")) {
            return res.status(400).json({ msg: "Invalid phone number" });
        }

        // if phone exists in db
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            console.log("Phone already exists");
            res.json({ msg: "Phone already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({ phone, otp });
        await sendSMS(`+91${phone}`, otp);

        res.json({ msg: "OTP sent" });
    } catch (err) {
        console.error("Error in sendOtp:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

const verifyOtp = async (req, res) => {
    //check frontend get all params
    //check phone and email validity (validator)
    //check phone exists in db

    try {
        const { phone, otp, name, email, password } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ msg: "Phone and OTP are required" });
        }
        if (!validator.isMobilePhone(phone, "en-IN")) {
            return res.status(400).json({ msg: "Invalid phone number format" });
        }

        const recentotp = await OTP.findOne({ phone }).sort({ createdAt: -1 });

        if (!recentotp || recentotp.otp !== otp) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        let user = await User.findOne({ phone });
        if (!user) user = await User.create({ phone, otp, name, email, password });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        console.log("JWT Token:", token);
        res.json({ token });

    } catch (err) {
        console.error("Error in verifyOtp:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
}

module.exports = { sendOtp, verifyOtp };
