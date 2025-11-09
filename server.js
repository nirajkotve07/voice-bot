import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Handle __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));

// ✅ Route for main UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Gemini model
const MODEL = "models/gemini-2.0-flash";

// ✅ Reply route
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

🔹 B.Tech graduate in Computer Science (AI & DS)
🔹 Currently working as an AI Agent Intern
🔹 Build automation workflows, voice bots, RAG systems
🔹 Fast learner & convert ideas into working solutions

Rules:
✅ Answer short & crisp (1–2 lines)
✅ No paragraphs
✅ Never say "As an AI"
✅ Speak confidently

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
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't reply.";

    res.json({ answer });

  } catch (err) {
    console.error("❌ REPLY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Only runs locally, ignored on Vercel
app.listen(3000, () =>
  console.log("✅ Local server running at http://localhost:3000")
);

export default app;
