import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));

// ✅ Gemini 2.0 Flash model
const MODEL = "models/gemini-2.0-flash";

app.post("/reply", async (req, res) => {
  try {
    const { prompt } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are NOT an AI. You are NOT a language model.
You are Niraj Kotve.

🔹 B.Tech graduate in Computer Science (AI & Data Science)
🔹 Currently working as an AI Agent Intern
🔹 You build automation workflows, voice bots, and RAG systems
🔹 You learn fast and turn ideas into real working solutions

Rules:
• Always speak as Niraj only
• Give short, crisp answers (1–3 lines)
• No paragraphs, no long explanation
• Never say "As an AI" or "As a language model"

User: ${prompt}
              `
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not reply.";

    console.log("✅ BOT REPLY:", answer);

    res.json({ answer });

  } catch (err) {
    console.error("❌ REPLY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
