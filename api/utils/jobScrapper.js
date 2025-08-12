import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import cheerio from 'cheerio';

const SCRAPPER_API_KEY = process.env.SCRAPPER_API_KEY;

/**
 * Fetch and parse page using ScraperAPI
 * @param {string} url - The URL to scrape
 * @returns {Promise<string>} - Returns raw text from the page
 */


const scraperApi = async (url) => {
  try {
    const response = await fetch(
        `https://api.scraperapi.com/?api_key=${SCRAPPER_API_KEY}&url=${encodeURIComponent(url)}&render=true&country_code=in`
      );
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error scraping API:", error);
    return null;
  }
};


async function extractFormattedTextWithLinks(html) {
    const $ = cheerio.load(html);

    $("script, style, noscript, svg, iframe, footer, header, nav").remove();

    const traverse = (elem) => {
        let result = "";

        $(elem).contents().each((_, el) => {
            if(el.type === "text") {
                result += $(el).text().replace(/\s+/g, " ");
            }
            else if (el.tagName === "a") {
                const linkText = $(el).text().trim().replace(/\s+/g, " ");
                const href = $(el).attr("href");
                if(href && linkText) {
                    result += `[${linkText}] (${href})\n`;
                }
            }
            else{
                result += traverse(el);
            }
        });
        return result;
    }
    const body = $("body");
  const formattedText = traverse(body).replace(/\s+/g, " ").trim();
  return formattedText;
};


//Model for job position
const jobPositionSchema = z.object({
  Title: z.string().describe("The title of the job position"),
  Description: z.string().describe("The description of the job position"),
  Company: z.string().describe("The company of the job position"),
  Link: z.string().describe("The link of the job position"),
  CompanyWebsite: z.string().describe("The website of the company of the job position"),
  Location: z.enum(["On-site", "Remote", "Hybrid"]).describe("The location of the job position, either On-site, Remote or Hybrid"),
  Type: z.enum(["Full-time", "Part-time", "Contract", "Freelance", "Internship"]).describe("The type of the job position, either Full-time, Part-time, Contract, Freelance or Internship"),
  Level: z.enum(["Intern", "Junior", "Mid", "Senior", "Lead", "Director", "VP"]).describe("The level of the job position, either Intern, Junior, Mid, Senior, Lead, Director or VP"),
  Role: z.string().describe("The role of the job position, just the name, not ObjectId"),
  Salary: z.object({
      min: z.number().describe("The minimum salary of the job position"),
      max: z.number().describe("The maximum salary of the job position"),
      currency: z.string().describe("The currency of the salary"),
      negotiable: z.boolean().describe("Whether the salary is negotiable or not"),
  }).describe("The salary of the job position"),
  EquityOffered: z.boolean().describe("Whether the job position offers equity or not"),
  BonusIncluded: z.boolean().describe("Whether the job position offers bonus or not"),
  ContractDuration: z.string().describe("The duration of the contract"),
  Responsibilities: z.array(z.string()).describe("The responsibilities of the job position"),
  Requirements: z.array(z.string()).describe("The requirements of the job position"),
  PreferredQualifications: z.array(z.string()).describe("The preferred qualifications of the job position"),
  Benefits: z.array(z.string()).describe("The benefits of the job position"),
  ApplicationUrl: z.string().describe("The application url of the job position"),
  PostedAt: z.date().describe("The date and time the job position was posted"),
  ClosingDate: z.date().describe("The date and time the job position closes"),
  Status: z.enum(["Active", "Inactive"]).describe("The status of the job position, either Active or Inactive"),
});


const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY
});

const analyseJobPosition = async (rawHTMLContent) => {
  try{
      const structuredLlm = model.withStructuredOutput(jobPositionSchema);
      const prompt = `
      You are an AI assistant helping extract structured job data from raw HTML or plain text content of job posts.

Given the content of a job posting, extract only the relevant data and return it in structured JSON format as per the predefined schema for a job position.
Do not infer or hallucinate missing data.
If a field is not present, return null for optional fields or leave it empty ([] for arrays).
Parse Salary, Location, Type, Level, and Dates accurately using common job listing conventions.
Extract Responsibilities, Requirements, Preferred Qualifications, and Benefits as clean bullet point lists.
Extract the Application URL from the "Apply" button or related link.
All dates must be in ISO 8601 format (e.g., 2025-07-31T00:00:00Z).
Ensure that enum values (e.g., Location, Type, Level, Status) strictly match allowed schema values.
Return only the structured JSON, nothing else

The raw HTML content is:
${rawHTMLContent}

Respond only in **pure JSON** format. No explanations.
`;
      console.log(prompt);
      const response = await structuredLlm.invoke(prompt);
      console.log(response);

      return response;
  } catch (error) {
      console.error("Error analysing job position:", error);
      return null;
  }
}

async function scrappedDataForJobPosition(url) {
  const html = await scraperApi(url);
  const formattedText = await extractFormattedTextWithLinks(html);
  const jobData = await analyseJobPosition(formattedText);
  return jobData;
};

export { scrappedDataForJobPosition };

