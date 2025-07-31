const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { StructuredOutputParser } = require("langchain/output_parsers");
const { PromptTemplate } = require("langchain/prompts");
const { z } = require("zod");

// Define the structured output schema
const analysisSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall performance score out of 100"),
  communicationSkills: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  technicalKnowledge: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  problemSolving: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  confidenceLevel: z.enum(["Low", "Medium", "High"]),
  responseQuality: z.object({
    clarity: z.number().min(0).max(100),
    relevance: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
  }),
  keyStrengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  specificFeedback: z.array(
    z.object({
      question: z.string(),
      response: z.string(),
      feedback: z.string(),
      score: z.number().min(0).max(100),
    })
  ),
  recommendations: z.array(z.string()),
  interviewSummary: z.string(),
  nextSteps: z.array(z.string()),
});

const analyseInterview = async (
  jobRole,
  conversation,
  difficulty,
  duration
) => {
  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-pro",
      temperature: 0.2,
      maxOutputTokens: 4000,
    });

//     const parser = StructuredOutputParser.fromZodSchema(analysisSchema);

//     const formatInstructions = parser.getFormatInstructions();

//     const prompt = new PromptTemplate({
//       template: `You are an expert interview analyst. Analyze the following interview conversation and provide a detailed, structured assessment.

// Job Role: {jobRole}
// Difficulty: {difficulty}
// Duration: {duration} minutes

// Conversation:
// {conversation}

// Analyze the candidate's performance and provide detailed feedback in the following structured format:

// {format_instructions}

// Focus on:
// 1. Communication skills (clarity, articulation, confidence)
// 2. Technical knowledge relevant to the role
// 3. Problem-solving abilities
// 4. Response quality and relevance
// 5. Specific examples from the conversation
// 6. Actionable recommendations for improvement

// Be thorough, constructive, and professional in your analysis.`,
//       inputVariables: ["jobRole", "conversation", "difficulty", "duration"],
//       partialVariables: { format_instructions: formatInstructions },
//     });

//     const input = await prompt.format({
//       jobRole: JSON.stringify(jobRole, null, 2),
//       conversation: conversation
//         .map((msg) => `${msg.role}: ${msg.content}`)
//         .join("\n"),
//       difficulty,
//       duration,
//     });

//     const response = await llm.invoke(input);
//     const analysis = await parser.parse(response.content);

    return true;
  } catch (error) {
    console.error("Error in analyseInterview:", error);
    throw error;
  }
};

module.exports = {
  analyseInterview,
};
