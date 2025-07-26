const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Login with Phone + Password
const loginWithPassword = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ msg: "Phone and password are required" });
        }

        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({ token });
    } catch (err) {
        console.error("Error in loginWithPassword:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

module.exports = {
    loginWithPassword,
};
