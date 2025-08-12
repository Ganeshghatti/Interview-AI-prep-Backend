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

app.get("/auth/linkedin", (req, res) => {
  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&` +
    // `state=${state._id}&` +
    `scope=${encodeURIComponent("profile openid email w_member_social")}`;
  res.send(authUrl);
});

app.get("/auth/linkedin/callback", async (req, res) => {
  const code = req.query.code;

  console.log(code, "code");
  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log("Received access token:", accessToken);

    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const personId = profileResponse.data.sub; // Use 'sub' instead of 'id'
    console.log("Retrieved person info:", profileResponse.data);

    // 2. Fetch user profile
    const [profileRes, emailRes] = await Promise.all([
      axios.get("https://api.linkedin.com/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get(
        "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ),
    ]);

    const userData = {
      id: profileRes.data.id,
      firstName: profileRes.data.localizedFirstName,
      lastName: profileRes.data.localizedLastName,
      email: emailRes.data.elements[0]["handle~"].emailAddress,
    };

    // Return or redirect with token/session/etc.
    res.json({ user: userData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Authentication failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
