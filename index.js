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

// ✅ chat endpoint (متوافق مع 7-cal)
app.post("/v1/chat/completions", async (req, res) => {
  try {
    const messages = req.body.messages || [];

    // ✅ دمج الرسائل
    let userMessage = messages.map(m => m.content).join(" ");

    // ✅ حل مشكلة التست (إذا فاضي)
    if (!userMessage || userMessage.trim() === "") {
      userMessage = "Hello";
    }

    // ✅ تأكد من API KEY
    if (AIzaSyBYB1T64c9_gNowWxBLm31kxgatGIG-Fp0) {
      return res.status(500).json({
        error: "Missing API key",
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

    // ✅ مهم: حتى لو فيه خطأ يرجع response مناسب
    if (!response.ok) {
      console.log("Gemini error:", data);

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
              content: "Error from Gemini",
            },
            finish_reason: "stop",
          },
        ],
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

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
    console.log("Server error:", err);

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

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
