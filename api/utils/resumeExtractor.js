import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

const profileSchema = z.object({
    name: z.string().describe("The name of the user"),
    email: z.string().describe("The email of the user"),
    phone: z.string().describe("The phone number of the user"),
    dateOfBirth: z.date().describe("The date of birth of the user"),
    gender: z.enum(["male", "female", "other"]).describe("The gender of the user"),
    address: z.object({
        street: z.string().describe("The street address of the user"),
        city: z.string().describe("The city of the user"),
        state: z.string().describe("The state of the user"),
        country: z.string().describe("The country of the user"),
        zip: z.string().describe("The zip code of the user"),
    }).describe("The address of the user"),
    currentRole: z.string().describe("The current role of the user"),
    currentCompany: z.string().describe("The current company of the user, not the school/university name if in the club or organization just the name of club or organization"),
    experience: z.array(z.object({
        jobTitle: z.string().describe("The job title of the user"),
        company: z.string().describe("The company of the user, club or organization name expected not the school/university name, if in the club or organization"),
        location: z.string().describe("The location of the company of user, if in the club or organization, then the location is the location of the club or organization"),
        employmentType: z.enum(["full-time", "part-time", "freelance", "internship"]).describe("The employment type of the user"),
        startDate: z.date().describe("The start date of the user"),
        endDate: z.date().describe("The end date of the user"),
        current: z.boolean().describe("Whether the user is currently working in this role"),
    })).describe("The experience of the user"),
    skills: z.array(z.string()).describe("The skills of the user"),
    education: z.array(z.object({
        degree: z.string().describe("The degree of the user"),
        field: z.string().describe("The field of the user"),
        institution: z.string().describe("The institution of the user"),
        graduationYear: z.number().describe("The graduation year of the user"),
        gpa: z.number().describe("The GPA of the user"),
    })).describe("The education of the user"),
    careerObjective: z.string().describe("The career objective of the user"),
    preferredJobRoles: z.array(z.string()).describe("The preferred job roles of the user"),
    preferredLocation: z.array(z.string()).describe("The preferred location of the user"),
    salaryExpectation: z.number().describe("The salary expectation of the user"),
    linkedinProfile: z.string().describe("The LinkedIn profile URL of the user"),
    githubProfile: z.string().describe("The GitHub profile URL of the user"),
    portfolio: z.string().describe("The portfolio URL of the user"),
});

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY
});

const validAndFormatData = (data) => {
    if (data.linkedinProfile && !data.linkedinProfile.startsWith("https://")) {
        data.linkedinProfile = `https://${data.linkedinProfile}`;
    }
    if (data.githubProfile && !data.githubProfile.startsWith("https://")) {
        data.githubProfile = `https://${data.githubProfile}`;
    }
    if (data.portfolio && !data.portfolio.startsWith("https://")) {
        data.portfolio = `https://${data.portfolio}`;
    }
    return data;
}

const extractProfile = async (rawResumeContent) => {
    try {
        const structuredLlm = model.withStructuredOutput(profileSchema);
        const prompt = `
        You are an AI assistant helping extract structured profile data from raw resume content.
        Given the content of a resume, extract only the relevant data and return it in structured JSON format as per the predefined schema for a profile.
        Do not infer or hallucinate missing data.
        If a field is not present, leave it empty(strictly, no null, undefined, or "string").
        Parse Salary, Location, Type, Level, and Dates accurately using common job listing conventions.
        Resume Content:
        ${rawResumeContent}
        Respond only in **pure JSON** format. No explanations.
        `;
        console.log(prompt);
        const response = await structuredLlm.invoke(prompt);
        const validData = validAndFormatData(response);
        console.log(validData);
        return validData;
    } catch (error) {
        console.error("Error extracting profile:", error);
        throw error;
    }
};


export { extractProfile };