const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin");
const bcrypt = require("bcryptjs");

exports.adminRegister = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }
    const existingAdmin = await Admin.findOne({ phone });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, msg: "Admin already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = await Admin.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    res.status(201).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Phone and password are required" });
    }

    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(401).json({ success: false, msg: "Admin not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Error in adminLogin:", err.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
