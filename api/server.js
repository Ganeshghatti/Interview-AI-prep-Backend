const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth/auth");
const adminRoutes = require("./routes/admin/routes");
const interviewPrepRoutes = require("./routes/interview-prep/take-interview");
const applyjobRoutes = require("./routes/apply-jobs/get-jobs");
const userdashboard = require("./routes/dashboard/dashboard");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Global rate limiting - applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply global rate limiting to all requests
app.use(globalLimiter);

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/interview-prep", interviewPrepRoutes);
app.use("/apply-jobs", applyjobRoutes);
app.use("/user", userdashboard);

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
