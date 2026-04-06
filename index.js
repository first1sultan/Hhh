import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// models endpoint
app.get("/v1/models", (req, res) => {
  res.json({
    data: [
      {
        id: "gemini-1.5-flash",
        object: "model",
      },
    ],
  });
});

// chat endpoint
app.post("/v1/chat/completions", async (req, res) => {
  try {
    console.log("Incoming:", req.body); // 🔥 debugging

    let userMessage = "";

    // ✅ يدعم messages و prompt
    if (req.body.messages) {
      userMessage = req.body.messages.map(m => m.content).join(" ");
    } else if (req.body.prompt) {
      userMessage = req.body.prompt;
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data); // 🔥 debugging

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.json({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-1.5-flash",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: text,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    });

  } catch (err) {
    console.log("Server error:", err);
    res.status(500).json({ error: "Proxy error" });
  }
});

// server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
