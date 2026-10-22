
const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Check Python AI service health
router.get("/health", protect, async (req, res) => {
  const pythonUrl = process.env.PYTHON_AI_URL;

  if (!pythonUrl) {
    return res.status(500).json({
      message: "PYTHON_AI_URL is not configured",
    });
  }

  try {
    const response = await fetch(`${pythonUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        message: "Python AI service returned an error",
        details: data,
      });
    }

    return res.status(200).json({
      message: "Python AI service connected successfully!",
      aiService: data,
    });
  } catch (error) {
    console.error("AI service connection error:", error.message);

    return res.status(503).json({
      message:
        "Could not connect to the Python AI service. Make sure FastAPI is running.",
    });
  }
});

// Analyze resume using the existing free Python service
router.post("/analyze", protect, async (req, res) => {
  const pythonUrl = process.env.PYTHON_AI_URL;

  if (!pythonUrl) {
    return res.status(500).json({
      message: "PYTHON_AI_URL is not configured",
    });
  }

  const { resume_text, job_description = "" } = req.body || {};

  if (
    typeof resume_text !== "string" ||
    resume_text.trim().length < 50 ||
    resume_text.length > 15000
  ) {
    return res.status(400).json({
      message:
        "Resume text must contain between 50 and 15000 characters.",
    });
  }

  if (
    typeof job_description !== "string" ||
    job_description.length > 10000
  ) {
    return res.status(400).json({
      message:
        "Job description must be a string of at most 10000 characters.",
    });
  }

  try {
    const response = await fetch(`${pythonUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_text: resume_text.trim(),
        job_description: job_description.trim(),
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status >= 500 ? 502 : response.status).json({
        message: "Resume analysis failed in the Python AI service.",
        details: data,
      });
    }

    return res.status(200).json({
      message: "Resume analyzed successfully!",
      analysis: data,
    });
  } catch (error) {
    console.error("Resume analysis error:", error.message);

    return res.status(503).json({
      message:
        "Could not reach the Python AI service. Check that FastAPI is running.",
    });
  }
});

// Improve resume using Gemini
// This endpoint returns suggestions without overwriting the saved resume.
router.post("/improve-resume", protect, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return res.status(500).json({
      message: "Gemini API key is not configured on the server.",
    });
  }

  const { resume_text, job_description = "" } = req.body || {};

  if (
    typeof resume_text !== "string" ||
    resume_text.trim().length < 50 ||
    resume_text.length > 15000
  ) {
    return res.status(400).json({
      message:
        "Resume text must contain between 50 and 15000 characters.",
    });
  }

  if (
    typeof job_description !== "string" ||
    job_description.length > 10000
  ) {
    return res.status(400).json({
      message:
        "Job description must be a string of at most 10000 characters.",
    });
  }

  const prompt = `
Improve the following resume for clarity, professionalism, and readability.

Please provide:
1. An improved professional summary, if appropriate.
2. Stronger descriptions of projects and experience.
3. Suggestions for presenting skills more effectively.
4. Specific recommendations for improving the resume.
5. If a job description is provided, relevant tailoring suggestions.

Important rules:
- Never invent employers, degrees, dates, certifications, skills, metrics, achievements, or responsibilities.
- Only use facts supported by the supplied resume.
- Mark missing information as questions or placeholders for the user to complete.
- Do not guarantee an ATS score or employment outcome.
- Organize your response with clear headings.

RESUME:
${resume_text.trim()}

JOB DESCRIPTION:
${job_description.trim() || "No job description supplied."}
`;

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction:
          "You are CareerPilot's resume improvement assistant. " +
          "Provide clear, practical, honest resume improvements. " +
          "Never fabricate qualifications or experience. Separate rewritten " +
          "content from recommendations and identify missing details as " +
          "questions or placeholders for the user to verify.",
      },
    });

    const improvements = response.text;

    if (
      typeof improvements !== "string" ||
      !improvements.trim()
    ) {
      return res.status(502).json({
        message: "Gemini returned an empty response. Please try again.",
      });
    }

    return res.status(200).json({
      message: "Resume improvement suggestions generated successfully.",
      improvements: improvements.trim(),
    });
  } catch (error) {
    const status = Number(error.status || error.statusCode);

    console.error(
      "Gemini resume improvement error:",
      status || "unknown status",
      error.message
    );

    if (status === 429) {
      return res.status(429).json({
        message:
          "Gemini's usage limit has been reached. Please try again later.",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        message:
          "Gemini rejected the API key or access. Check your key and model access.",
      });
    }

    if (status === 404) {
      return res.status(502).json({
        message:
          "The configured Gemini model is unavailable. Check GEMINI_MODEL.",
      });
    }

    return res.status(502).json({
      message: "Gemini could not improve the resume. Please try again.",
    });
  }
});

// Gemini-powered Career Assistant
router.post("/chat", protect, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return res.status(500).json({
      message: "Gemini API key is not configured on the server.",
    });
  }

  const { message, history = [] } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      message: "Please enter a career-related question.",
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      message: "Your message must be 2000 characters or fewer.",
    });
  }

  if (!Array.isArray(history) || history.length > 20) {
    return res.status(400).json({
      message: "Conversation history must contain at most 20 messages.",
    });
  }

  for (const item of history) {
    if (
      !item ||
      !["user", "assistant"].includes(item.role) ||
      typeof item.content !== "string" ||
      !item.content.trim() ||
      item.content.length > 4000
    ) {
      return res.status(400).json({
        message: "Conversation history contains an invalid message.",
      });
    }
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      ...history.map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
      })),
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction:
          "You are CareerPilot, a helpful career guidance assistant. " +
          "Use the conversation history to understand follow-up questions " +
          "and maintain context. Help with career planning, technical learning " +
          "roadmaps, resume improvement, job searches, and interview preparation. " +
          "Give practical, clear, encouraging answers with actionable steps. " +
          "Ask a brief follow-up question when important context is missing. " +
          "Do not guarantee jobs or invent qualifications. Politely redirect " +
          "unrelated questions toward careers, education, skills, or professional development.",
      },
    });

    const reply = response.text;

    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({
        message: "Gemini returned an empty response. Please try again.",
      });
    }

    return res.status(200).json({
      message: "Career advice generated successfully.",
      reply: reply.trim(),
    });
  } catch (error) {
    const status = Number(error.status || error.statusCode);

    console.error(
      "Gemini Career Assistant error:",
      status || "unknown status",
      error.message
    );

    if (status === 429) {
      return res.status(429).json({
        message:
          "Gemini's usage limit has been reached. Please try again later.",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        message:
          "Gemini rejected the API key or access. Check your key and model access.",
      });
    }

    if (status === 404) {
      return res.status(502).json({
        message:
          "The configured Gemini model is unavailable. Check GEMINI_MODEL.",
      });
    }

    return res.status(502).json({
      message: "Gemini could not generate a response. Please try again.",
    });
  }
});

module.exports = router;
