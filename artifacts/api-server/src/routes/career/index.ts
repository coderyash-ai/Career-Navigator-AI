import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import {
  GetCareerRecommendationsBody,
  GetCareerRoadmapBody,
  GetYoutubeSuggestionsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/recommendations", async (req, res) => {
  const body = GetCareerRecommendationsBody.parse(req.body);

  const prompt = `You are an expert career counselor and AI career advisor. Based on the following student profile, recommend exactly 5 distinct career paths.

Student Profile:
- Skills: ${body.skills.join(", ")}
- Interests: ${body.interests.join(", ")}
- Education: ${body.education || "Not specified"}
- Experience: ${body.experience || "Entry level"}
- Career Goals: ${body.goals || "Not specified"}

Respond with ONLY a valid JSON object (no markdown, no code blocks, just raw JSON) in this exact format:
{
  "recommendations": [
    {
      "careerTitle": "string",
      "matchPercentage": number between 60-98,
      "explanation": "2-3 sentence explanation of why this career matches their profile",
      "missingSkills": ["skill1", "skill2", "skill3"],
      "salary": "e.g. $70,000 - $120,000",
      "jobOutlook": "one of: Excellent, Very Good, Good, Fair"
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text ?? "{}";
  const parsed = JSON.parse(rawText);
  res.json(parsed);
});

router.post("/roadmap", async (req, res) => {
  const body = GetCareerRoadmapBody.parse(req.body);

  const prompt = `You are an expert career counselor. Create a detailed, actionable learning roadmap for a student who wants to become a ${body.careerTitle}.

Student's Current Skills: ${body.currentSkills.join(", ")}
Desired Career: ${body.careerTitle}
Timeframe: ${body.timeframe || "12-18 months"}

Respond with ONLY a valid JSON object (no markdown, no code blocks, just raw JSON) in this exact format:
{
  "careerTitle": "${body.careerTitle}",
  "totalDuration": "e.g. 12-18 months",
  "milestones": [
    {
      "monthRange": "e.g. Month 1-3",
      "focusArea": "Specific area of focus for this period",
      "specificTopics": ["topic1", "topic2", "topic3", "topic4"],
      "projectIdea": "A concrete hands-on project to build in this phase",
      "resources": ["Resource name 1", "Resource name 2", "Resource name 3"]
    }
  ]
}

Create 4-6 milestones that logically progress from beginner to job-ready level.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text ?? "{}";
  const parsed = JSON.parse(rawText);
  res.json(parsed);
});

router.post("/youtube-suggestions", async (req, res) => {
  const body = GetYoutubeSuggestionsBody.parse(req.body);

  const prompt = `You are an expert educational content curator. Suggest 8 specific YouTube channels and video series for someone learning ${body.careerTitle}.

Topics to cover: ${body.topics.join(", ")}

Respond with ONLY a valid JSON object (no markdown, no code blocks, just raw JSON) in this exact format:
{
  "videos": [
    {
      "title": "Specific video or series title",
      "channel": "YouTube Channel Name",
      "searchQuery": "exact search query to find this on YouTube",
      "description": "1-2 sentence description of what this covers",
      "category": "one of: Fundamentals, Advanced, Project-Based, Interview Prep, Career Tips, Tools & Frameworks"
    }
  ]
}

Make the search queries very specific and searchable. Include a mix of categories.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text ?? "{}";
  const parsed = JSON.parse(rawText);
  res.json(parsed);
});

export default router;
