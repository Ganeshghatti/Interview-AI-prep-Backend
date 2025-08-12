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
import { RealtimeClient } from "@openai/realtime-api-beta";

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

const client = new RealtimeClient({
  apiKey: process.env.TENSOR_STUDIO_API,
});

async function initTensorSession() {
  await client.connect();
  await client.updateSession({
    instructions: "You are a friendly interviewer.",
    voice: "monica",
    language: "en",
    turn_detection: {
      type: "server_vad",
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
    },
  });
}

app.get("/test", async (req, res) => {
  try {
    await initTensorSession();

    client.on("conversation.updated", ({ item, delta }) => {
      console.log(item, delta);
    });
    client.on("response.output_text.delta", (event) => {
      console.log("AI text delta:", event.delta);
    });
    client.on("response.completed", (event) => {
      console.log("Final response:", event.output_text);
    });
    await client.createResponse({
      instructions: "Hello, can you introduce yourself?",
      modalities: ["text", "audio"],
    });
    await client.createResponse({
      instructions: "Hello, can you introduce yourself?",
      modalities: ["text", "audio"],
    });
    client.on("response.output_text.delta", console.log);
    client.on("response.completed", console.log);

    client.sendUserMessageContent([
      { type: "input_text", text: "Hello, can you introduce yourself?" },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error starting TensorStudio test.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
