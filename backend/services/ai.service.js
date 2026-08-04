import { GoogleGenAI } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";

let client = null;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      503,
      "Gemini API key is not configured. Add GEMINI_API_KEY to the backend .env file."
    );
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
};

const getModelCandidates = () => {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const configuredFallbacks = (process.env.GEMINI_FALLBACK_MODELS || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  const models = [];

  if (configuredModel) {
    models.push(configuredModel);
  }

  for (const model of configuredFallbacks) {
    if (!models.includes(model)) {
      models.push(model);
    }
  }

  if (models.length === 0) {
    models.push(
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-2.5-flash-lite",
      "gemma-4"
    );
  }

  return models;
};

export const getConfiguredModels = () => getModelCandidates();

export const isAIConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const isQuotaOrLimitError = (message = "") =>
  /quota|resource_exhausted|rate limit|429|limit exceeded/i.test(message);

const generateJSON = async (prompt, schema) => {
  const ai = getClient();
  const errors = [];

  for (const model of getModelCandidates()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.6,
        },
      });

      return JSON.parse(response.text);
    } catch (err) {
      const message = err?.message || String(err || "Unknown Gemini error");
      errors.push({ model, message });
      console.error(`Gemini JSON error for ${model}:`, message);
    }
  }

  const quotaError = errors.find(({ message }) => isQuotaOrLimitError(message));

  if (quotaError) {
    throw new ApiError(
      429,
      "Gemini API quota has been exceeded. Please wait a bit or upgrade your API plan."
    );
  }

  throw new ApiError(502, "AI request failed. Please try again in a moment.");
};

const generateText = async (prompt, temperature = 0.7) => {
  const ai = getClient();
  const errors = [];

  for (const model of getModelCandidates()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { temperature },
      });

      return response.text.trim();
    } catch (err) {
      const message = err?.message || String(err || "Unknown Gemini error");
      errors.push({ model, message });
      console.error(`Gemini text error for ${model}:`, message);
    }
  }

  const quotaError = errors.find(({ message }) => isQuotaOrLimitError(message));

  if (quotaError) {
    throw new ApiError(
      429,
      "Gemini API quota has been exceeded. Please wait a bit or upgrade your API plan."
    );
  }

  throw new ApiError(502, "AI request failed. Please try again in a moment.");
};

export const generateLeadSummary = async (lead) => {
  const prompt = `You are an expert B2B sales analyst for a CRM called AICRM.
Analyse the following sales lead and produce a concise assessment.

Lead details:
- Name: ${lead.name || "N/A"}
- Company: ${lead.company || "N/A"}
- Email: ${lead.email || "N/A"}
- Current pipeline stage: ${lead.status || "New"}
- Potential deal value: $${lead.value || 0}
- Source: ${lead.source || "Unknown"}
- Notes: ${lead.notes || "None"}

Return JSON only.`;

  const schema = {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "2-3 sentence executive summary of the lead",
      },
      riskScore: {
        type: "integer",
        description: "Risk of losing this deal, 0 (safe) to 100 (high risk)",
      },
      suggestedPriority: {
        type: "string",
        enum: ["Low", "Medium", "High"],
      },
      nextBestAction: {
        type: "string",
        description: "One concrete recommended next step",
      },
    },
    required: [
      "summary",
      "riskScore",
      "suggestedPriority",
      "nextBestAction",
    ],
  };
  return generateJSON(prompt, schema);
};

export const generateEmail = async ({ lead, purpose, tone, sender }) => {
  const prompt = `You are a senior sales rep writing on behalf of ${
    sender?.name || "our team"
  }${sender?.company ? ` at ${sender.company}` : ""}.

Write a professional sales email.
Purpose: ${purpose || "follow-up"}
Desired tone: ${tone || "friendly and professional"}

Recipient (lead) details:
- Name: ${lead?.name || "there"}
- Company: ${lead?.company || "N/A"}
- Pipeline stage: ${lead?.status || "New"}
- Context / notes: ${lead?.notes || "None"}

Return JSON only with a compelling subject line and a complete email body.
Use line breaks (\\n) in the body. Keep it under 180 words. Sign off as ${
    sender?.name || "the AICRM team"
  }.`;

  const schema = {
    type: "object",
    properties: {
      subject: { type: "string" },
      body: { type: "string" },
    },
    required: ["subject", "body"],
  };

  return generateJSON(prompt, schema);
};

export const generateSalesInsights = async (pipelineStats) => {
  const prompt = `You are a revenue-operations advisor. Given this snapshot of a 
  sales pipeline, identify what is working, what is at risk, and concrete 
  actions to improve conversion.

Pipeline snapshot (JSON):
${JSON.stringify(pipelineStats, null, 2)}

Return JSON only. healthScore must be an integer between 0 and 100 inclusive. If the computed score is outside that range, clamp it to 0 or 100. Do not use scientific notation, and do not add any text outside the JSON object.`;

  const schema = {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "One-sentence summary of pipeline health",
      },
      insights: {
        type: "array",
        description: "3-5 specific, data-driven observations",
        items: { type: "string" },
      },
      recommendations: {
        type: "array",
        description: "3-5 prioritized, actionable recommendations",
        items: { type: "string" },
      },
      healthScore: {
        type: "integer",
        description: "Overall pipeline health, 0-100",
      },
    },
    required: [
      "headline",
      "insights",
      "recommendations",
      "healthScore",
    ],
  };

  return generateJSON(prompt, schema);
};

export {generateText};