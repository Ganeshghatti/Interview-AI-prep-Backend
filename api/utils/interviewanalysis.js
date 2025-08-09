import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define the structured output schema
const analysisSchema = z.object({
  // Overall Performance Metrics
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall performance score out of 100"),

  // Detailed Performance Categories
  performanceMetrics: z.object({
    communicationSkills: z.object({
      score: z.number().min(0).max(100),
      clarity: z.number().min(0).max(100),
      articulation: z.number().min(0).max(100),
      listeningSkills: z.number().min(0).max(100),
      improvements: z.array(z.string()),
    }),

    technicalCompetency: z.object({
      score: z.number().min(0).max(100),
      domainKnowledge: z.number().min(0).max(100),
      practicalApplication: z.number().min(0).max(100),
      industryAwareness: z.number().min(0).max(100),
      toolsProficiency: z.number().min(0).max(100),
      recommendations: z.array(z.string()),
    }),

    problemSolvingAbility: z.object({
      score: z.number().min(0).max(100),
      analyticalThinking: z.number().min(0).max(100),
      creativity: z.number().min(0).max(100),
      structuredApproach: z.number().min(0).max(100),
      decisionMaking: z.number().min(0).max(100),
      suggestions: z.array(z.string()),
    }),

    behavioralAssessment: z.object({
      score: z.number().min(0).max(100),
      leadership: z.number().min(0).max(100),
      teamwork: z.number().min(0).max(100),
      adaptability: z.number().min(0).max(100),
      initiative: z.number().min(0).max(100),
      conflictResolution: z.number().min(0).max(100),
      development: z.array(z.string()),
    }),
  }),

  // Question-by-Question Analysis
  questionAnalysis: z.array(
    z.object({
      questionNumber: z.number(),
      questionType: z.enum([
        "Behavioral",
        "Technical",
        "Situational",
        "Experience",
        "Hypothetical",
      ]),
      question: z.string(),
      candidateResponse: z.string(),
      responseScore: z.number().min(0).max(100),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
    })
  ),

  // Competency Radar Chart Data
  competencyRadar: z.object({
    technicalSkills: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    leadership: z.number().min(0).max(100),
    teamwork: z.number().min(0).max(100),
    adaptability: z.number().min(0).max(100),
  }),

  // Interview Flow Analysis
  interviewFlow: z.object({
    questionsAsked: z.number(),
    averageQuestionGap: z.number(),
    conversationFlow: z.enum(["Excellent", "Good", "Average", "Poor"]),
    engagement: z.enum(["High", "Medium", "Low"]),
  }),

  // Strengths and Improvement Areas
  keyInsights: z.object({
    topStrengths: z.array(
      z.object({
        area: z.string(),
        evidence: z.array(z.string()),
        impact: z.enum(["High", "Medium", "Low"]),
      })
    ),
    criticalImprovements: z.array(
      z.object({
        area: z.string(),
        priority: z.enum(["High", "Medium", "Low"]),
        actionItems: z.array(z.string()),
        resources: z.array(z.string()),
      })
    ),
  }),

  // Role Fit Assessment
  roleFitAnalysis: z.object({
    overallFit: z.number().min(0).max(100),
    roleReadiness: z.enum([
      "Ready",
      "Nearly Ready",
      "Needs Development",
      "Not Ready",
    ]),
    experienceAlignment: z.number().min(0).max(100),
    skillsMatch: z.number().min(0).max(100),
    culturalFit: z.number().min(0).max(100),
    growthPotential: z.number().min(0).max(100),
  }),

  // Recommendations and Next Steps
  actionPlan: z.object({
    immediateActions: z.array(
      z.object({
        action: z.string(),
        timeline: z.string(),
        priority: z.enum(["High", "Medium", "Low"]),
      })
    ),
    longTermDevelopment: z.array(
      z.object({
        goal: z.string(),
        timeline: z.string(),
        steps: z.array(z.string()),
      })
    ),
    trainingRecommendations: z.array(
      z.object({
        skillArea: z.string(),
        trainingType: z.string(),
        priority: z.enum(["High", "Medium", "Low"]),
      })
    ),
  }),
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
});

const analyseInterview = async (
  jobRole,
  conversation,
  difficulty,
  duration
) => {
  try {
    const structuredLlm = model.withStructuredOutput(analysisSchema);

    const formattedConversation = conversation
      .map((msg, index) => {
        const timestamp = msg.timestamp
          ? new Date(msg.timestamp).toLocaleTimeString()
          : "Unknown time";
        return `[${index + 1}] ${msg.role.toUpperCase()} (${timestamp}): ${
          msg.content
        }`;
      })
      .join("\n\n");

    const prompt = `
    You are an expert interview analyst with deep expertise in talent assessment, behavioral psychology, and role-specific competency evaluation. Analyze the following interview conversation and provide a comprehensive, data-driven assessment.

**INTERVIEW CONTEXT:**
- Job Role: ${jobRole}
- Difficulty Level: ${difficulty}
- Scheduled Duration: ${duration} minutes

**CONVERSATION TRANSCRIPT:**
${formattedConversation}

**ANALYSIS REQUIREMENTS:**

1. **Comprehensive Scoring**: Evaluate all performance dimensions with numerical scores (0-100)
2. **Evidence-Based Assessment**: Support all scores and observations with specific examples from the conversation
3. **Role-Specific Evaluation**: Tailor assessment criteria to the specific job role requirements
4. **Actionable Insights**: Provide concrete, implementable recommendations
5. **Data-Driven Metrics**: Include quantitative measures wherever possible
6. **Frontend-Ready Structure**: Organize data for easy visualization and presentation

**EVALUATION FOCUS AREAS:**

**Communication Assessment:**
- Clarity of expression and articulation
- Listening skills and response relevance
- Professional communication style
- Confidence and engagement level

**Technical Competency:**
- Domain knowledge demonstration
- Practical application of skills
- Industry awareness and trends
- Tools and technology proficiency

**Problem-Solving Evaluation:**
- Analytical thinking patterns
- Creative solution approaches
- Structured problem breakdown
- Decision-making process

**Behavioral Analysis:**
- Leadership potential indicators
- Team collaboration skills
- Adaptability and flexibility
- Initiative and proactivity

**Response Quality Metrics:**
- Relevance to questions asked
- Completeness of answers
- Depth of knowledge demonstrated
- Structure and organization

**Role Fit Assessment:**
- Alignment with job requirements
- Experience relevance
- Skill gap analysis
- Growth potential evaluation

Provide a thorough, professional analysis that would be valuable for both the candidate's development and hiring decision-making. Ensure all numerical scores are realistic and well-justified based on the actual conversation content.

Generate the analysis in the specified structured format with comprehensive data points for frontend visualization.
    `;

    console.log(prompt);

    const response = await structuredLlm.invoke(prompt);

    console.log(response);

    return response;
  } catch (error) {
    console.error("Error in analyseInterview:", error);
    throw error;
  }
};

export {
  analyseInterview,
};
