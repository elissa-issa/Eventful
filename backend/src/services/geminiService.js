const { GoogleGenAI } = require('@google/genai');
const { ApiError } = require('../helpers/apiError');

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(503, 'Gemini API key is not configured on the backend.');
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

function stripMarkdownJson(text) {
  const trimmed = String(text || '').trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fencedMatch ? fencedMatch[1].trim() : trimmed;
}

function parseGeminiPlanResponse(text) {
  try {
    return JSON.parse(stripMarkdownJson(text));
  } catch {
    throw new ApiError(502, 'Could not parse AI plan response');
  }
}

function isQuotaError(error) {
  const status = error?.status || error?.code;
  const message = String(error?.message || '').toLowerCase();

  return (
    status === 429 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('resource_exhausted')
  );
}

async function generateInspirationPlan({ userMessage, services }) {
  const ai = getClient();
  const prompt = `
You are Eventful's AI event planner.
You must create a plan using ONLY the provided Eventful services.
Do not invent services.
Every recommended item must use an existing serviceType and itemId from the available services list.
Return valid JSON only. Do not include markdown.

Required JSON shape:
{
  "title": string,
  "summary": string,
  "recommendedItems": [
    {
      "serviceType": "menus" | "venues" | "decorations" | "entertainment" | "bundles",
      "itemId": string,
      "reason": string
    }
  ],
  "estimatedTotal": number,
  "planningTips": string[]
}

User request and available Eventful services:
${JSON.stringify({
  request: userMessage,
  availableServices: services,
})}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return parseGeminiPlanResponse(response.text);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('[Gemini] Inspiration plan generation failed:', error.message);

    if (isQuotaError(error)) {
      throw new ApiError(503, 'AI planner is temporarily unavailable. Please try again later.');
    }

    throw new ApiError(502, 'Could not generate an AI plan right now.');
  }
}

module.exports = {
  generateInspirationPlan,
  parseGeminiPlanResponse,
};
