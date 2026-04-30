import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth/auth.js";
import adminRoutes from "./routes/admin/routes.js";
import interviewPrepRoutes from "./routes/interview-prep/take-interview.js";
import applyjobRoutes from "./routes/apply-jobs/get-jobs.js";
import userdashboard from "./routes/dashboard/dashboard.js";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors({
  exposedHeaders : ['X-Audio-Text']
}));
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
