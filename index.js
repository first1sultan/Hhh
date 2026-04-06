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
        id: "gemini-3.1-flash",
        object: "model",
      },
    ],
  });
});

// chat endpoint
app.post("/v1/chat/completions", async (req, res) => {
  try {
    // ✅ يدعم أكثر من رسالة (مهم لـ 7-cal)
    const userMessage =
      req.body.messages?.map(m => m.content).join(" ") || "";

    // ✅ تأكد من وجود المفتاح
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.json({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-3.1-flash",
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
    });

  } catch (err) {
    res.status(500).json({ error: "Proxy error" });
  }
});

// server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
