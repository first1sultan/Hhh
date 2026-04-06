import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const userMessage = req.body.messages?.[0]?.content || "";

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
