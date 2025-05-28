import OpenAI from "openai";
import { extractedResumeDataSchema, type ExtractedResumeData } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export async function parseResumeContent(resumeText: string): Promise<ExtractedResumeData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Analyze the provided resume text and extract structured information. 

Return the data in this exact JSON format:
{
  "skills": ["array of technical skills found"],
  "experience": "brief summary of work experience",
  "education": "education background summary",
  "recentRole": "most recent job title",
  "experienceYears": number_of_years_of_experience,
  "summary": "brief professional summary"
}

Guidelines:
- Extract only technical skills (programming languages, frameworks, tools, etc.)
- For experienceYears, estimate based on work history or explicitly stated years
- Keep summaries concise but informative
- If information is not available, use appropriate defaults`
        },
        {
          role: "user",
          content: `Please parse this resume and extract the information:\n\n${resumeText}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedData = JSON.parse(content);
    
    // Validate the parsed data against our schema
    const validatedData = extractedResumeDataSchema.parse(parsedData);
    
    return validatedData;
  } catch (error) {
    console.error("Error parsing resume with OpenAI:", error);
    throw new Error("Failed to parse resume content: " + error.message);
  }
}

export async function generateJobRecommendations(
  extractedData: ExtractedResumeData,
  availableJobs: Array<{
    id: number;
    title: string;
    company: string;
    requiredSkills: string[];
    experienceYears: number;
    description: string;
    level: string;
  }>
): Promise<Array<{
  jobId: number;
  matchScore: number;
  matchingSkills: string[];
  reasoning: string;
}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert job matching system. Given a candidate's extracted resume data and available jobs, calculate match scores and provide recommendations.

For each job, calculate a match score (0-100) based on:
- Skill overlap (40% weight)
- Experience level match (30% weight)
- Industry/role relevance (30% weight)

Return recommendations in this JSON format:
{
  "recommendations": [
    {
      "jobId": number,
      "matchScore": number (0-100),
      "matchingSkills": ["skills that match"],
      "reasoning": "brief explanation of why this is a good/bad match"
    }
  ]
}

Only include jobs with match scores above 50. Sort by match score descending.`
        },
        {
          role: "user",
          content: `Candidate Profile:
Skills: ${extractedData.skills.join(", ")}
Experience: ${extractedData.experience}
Years of Experience: ${extractedData.experienceYears}
Recent Role: ${extractedData.recentRole}

Available Jobs:
${availableJobs.map(job => `
Job ID: ${job.id}
Title: ${job.title}
Company: ${job.company}
Required Skills: ${job.requiredSkills.join(", ")}
Experience Required: ${job.experienceYears} years
Level: ${job.level}
Description: ${job.description.substring(0, 200)}...
`).join("\n")}

Please provide job recommendations for this candidate.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);
    return result.recommendations || [];
  } catch (error) {
    console.error("Error generating job recommendations:", error);
    throw new Error("Failed to generate job recommendations: " + error.message);
  }
}
