import JobRole from "../../models/job-roles.js";
import InterviewPrep from "../../models/interview-prep.js";
import User from "../../models/user.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import axios from "axios";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { analyseInterview } from "../../utils/interviewanalysis.js";

// async function testAnalysis (interviewId) {
//   try {
//     const interview = await InterviewPrep.findById(
//       // "688cb84cd49a2574e0230efc"
//       interviewId
//     ).populate("jobRoleId");

//     if (interview) {
//       // Get structured analysis
//       const analysis = await analyseInterview(
//         interview.jobRoleId.title,
//         interview.conversation,
//         interview.difficulty,
//         interview.duration
//       );
//       console.log(`Structured analysis saved for interview ${interview._id}`);
//       return analysis;
//     }
//   } catch (error) {
//     console.error(
//       `Error updating interview status or analysis: ${error.message}`
//     );
//   }
// };

//const elevenlabs = new ElevenLabsClient({
//   apiKey: process.env.ELEVEN_LABS_KEY,
// });

export const getAllActiveJobRoles = async (req, res) => {
  try {
    const jobRoles = await JobRole.find({ status: "Active" });
    res.status(200).json({ success: true, jobRoles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startInterviewPrep = async (req, res) => {
  try {
    const { jobRoleId, userId } = req.params;
    const { duration, difficulty } = req.body;
    console.log("Starting interview preparation with:", {
      jobRoleId,
      userId,
      duration,
      difficulty,
    });
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    if (!jobRoleId) {
      return res
        .status(400)
        .json({ success: false, message: "Job role ID is required" });
    }

    const jobRole = await JobRole.findById(jobRoleId);

    if (!jobRole || jobRole.status !== "Active") {
      return res
        .status(404)
        .json({ success: false, message: "Job role not found or inactive" });
    }

    const endTime = new Date(Date.now() + duration * 60 * 1000);
    const interviewPrep = await InterviewPrep.create({
      jobRoleId,
      userId,
      difficulty: difficulty,
      duration: Number(duration),
      conversation: [],
      analytics: {},
      status: "in-progress",
      startTime: new Date(),
      endTime,
      createdAt: new Date(),
    });

    // Set timeout to update status when interview ends
    // const timeUntilEnd = endTime - Date.now();
    // setTimeout(async () => {
    //   try {
    //     const interview = await InterviewPrep.findById(
    //       interviewPrep._id
    //     ).populate("jobRoleId");

    //     if (!interview) {
    //       return res.status(404).json({
    //         success: false,
    //         message: "Interview not found",
    //       });
    //     }

    //     if (interview) {
    //       // Get structured analysis
    //       const analysis = await analyseInterview(
    //         interview.jobRoleId.title,
    //         interview.conversation,
    //         interview.difficulty,
    //         interview.duration
    //       );

    //       // Save to analytics field
    //       interview.analytics = analysis;
    //       interview.status = "completed";

    //       await interview.save();
    //       console.log(
    //         `Structured analysis saved for interview ${interview._id}`
    //       );
    //     }
    //   } catch (error) {
    //     console.error(
    //       `Error updating interview status or analysis: ${error.message}`
    //     );
    //   }
    // }, timeUntilEnd);

    res.status(201).json({
      success: true,
      message: "Interview preparation started",
      interviewPrep,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const inprogressInterview = async (req, res) => {
//   try {
//     const { interviewId } = req.params;
//     const { text } = req.body;

//     const interview = await InterviewPrep.findById(interviewId).populate(
//       "jobRoleId",
//       "title description skills tools responsibilities"
//     );

//     if (!interview) {
//       return res.status(404).json({
//         success: false,
//         message: "Interview not found",
//       });
//     }

//     if (interview.status !== "in-progress") {
//       return res.status(400).json({
//         success: false,
//         message: "Interview is not in progress",
//       });
//     }

//     console.log(interview);
//     const prompt = `You are Dale, senior ${
//       interview.jobRoleId.title
//     } at interview AI prep who helps to prepare candidates for the interview. The interview preparation is designed to simulate realistic, role-specific job interviews in a conversational format. You act as a recruiter or hiring manager from the relevant industry and adapt your questioning style based on the role, difficulty, and duration of the interview.

// <interview_metadata>
// - job_role: ${interview.jobRoleId.title}  // e.g., Product Manager
// - difficulty: ${interview.difficulty}  // e.g., Beginner, Intermediate, Advanced
// - duration: ${interview.duration} // e.g., 15 minutes
// </interview_metadata>

// <interview_structure>
// - Begin by greeting the candidate professionally and explaining the format.
// - Ask between 5–10 questions depending on the duration.
// - Space questions evenly throughout the session to match the allotted time.
// - Use a mix of question types:
//   - Behavioral
//   - Situational
//   - Role-specific knowledge
//   - Strategy or business acumen (for mid/senior roles)
// - Wait for the candidate's full response to each question.
// - Do not interrupt; pause and allow natural conversation flow.
// - Do not give feedback until the entire interview is over.
// </interview_structure>

// <communication_guidelines>
// - Maintain a natural, human-like tone.
// - Keep responses super concise and on-point unless deeper probing is needed.
// - Do not give answers, hints, or lead the candidate.
// - Stay within the context of the specified role and industry.
// - Use inclusive and professional language.
// </communication_guidelines>

// <conversation history>
// ${interview.conversation
//   .map((msg) => `${msg.role}: ${msg.content} (${msg.timestamp})`)
//   .join("\n")}
// - User: ${text} (${new Date()})
// </conversation history>

// <important notes>
// - Keep your responses as short and concise as possible.
// </important notes>
//   `;

//     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
//     const model = genAI.getGenerativeModel({
//       model: "gemini-1.5-flash",
//       temperature: 0.2,
//       maxOutputTokens: 200,
//     });

//     console.log(prompt);

//     const result = await model.generateContent(prompt);
//     const reply = await result.response.text();

//     const audio = await elevenlabs.textToSpeech.convert(
//       "JBFqnCBsd6RMkjVDRZzb",
//       {
//         text: reply,
//         modelId: "eleven_multilingual_v2",
//         outputFormat: "mp3_44100_128",
//       }
//     );
//     console.log(audio, "Audio generated successfully");

//     // Convert ReadableStream to Buffer
//     const chunks = [];
//     const reader = audio.getReader();

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       chunks.push(value);
//     }

//     const audioBuffer = Buffer.concat(chunks);

//     // Add conversation to interview
//     interview.conversation.push({
//       role: "user",
//       content: text,
//       timestamp: new Date(),
//     });

//     interview.conversation.push({
//       role: "AI",
//       content: reply,
//       timestamp: new Date(),
//     });

//     await interview.save();

//     // Set response headers for audio streaming
//     res.setHeader("Content-Type", "audio/mpeg");
//     res.setHeader("Content-Length", audioBuffer.length);
//     res.setHeader("Accept-Ranges", "bytes");
//     res.setHeader("Cache-Control", "no-cache");

//     // Send response with text and stream audio
//     res.status(200).json({
//       success: true,
//       message: "Response generated successfully",
//       response: {
//         text: reply,
//         audioData: audioBuffer.toString("base64"), // Send as base64
//         audioFormat: "mp3",
//       },
//     });
//   } catch (error) {
//     console.error("Error in inprogressInterview:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getInterviewPrepById = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interviewPrep = await InterviewPrep.findById(interviewId).populate(
      "jobRoleId",
      "title"
    );

    if (!interviewPrep) {
      return res
        .status(404)
        .json({ success: false, message: "Interview prep not found" });
    }

    res.status(200).json({ success: true, interviewPrep });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endInterviewPrep = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { conversation } = req.body;

    const interview = await InterviewPrep.findById(interviewId).populate(
      "jobRoleId",
      "title"
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Interview is not in progress",
      });
    }

    if (interview) {
      interview.conversation = conversation;
      interview.endTime = new Date();
      interview.status = "completed";


      // Get structured analysis
       interview.analytics = await analyseInterview(
        interview.jobRoleId.title,
        interview.conversation,
        interview.difficulty,
        interview.duration
      );

      await interview.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Interview ended successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
