import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ models endpoint
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

// ✅ chat endpoint
app.post("/v1/chat/completions", async (req, res) => {
  try {
    const messages = req.body.messages || [];

    // دمج الرسائل
    let userMessage = messages.map(m => m.content).join(" ");

    // fallback لو فاضي (مهم لـ test)
    if (!userMessage || userMessage.trim() === "") {
      userMessage = "Hello";
    }

    // تحقق من المفتاح
    if (!GEMINI_API_KEY) {
      return res.json({
        id: "chatcmpl-error",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gemini-1.5-flash",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Missing GEMINI_API_KEY",
            },
            finish_reason: "stop",
          },
        ],
      });
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

    // 🔥 طباعة الرد الكامل في logs
    console.log("FULL GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    // ❌ لو Gemini رجع خطأ
    if (!response.ok || !data.candidates) {
      return res.json({
        id: "chatcmpl-error",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gemini-1.5-flash",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Gemini error: " + JSON.stringify(data),
            },
            finish_reason: "stop",
          },
        ],
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated";

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
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);

    res.json({
      id: "chatcmpl-error",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-1.5-flash",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Server error",
          },
          finish_reason: "stop",
        },
      ],
    });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
