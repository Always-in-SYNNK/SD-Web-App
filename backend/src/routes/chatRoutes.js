import { Router } from "express";
import OpenAI from "openai";
// Remove this line: import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Debug: Check if API key is loaded
console.log("🔵 OPENAI_API_KEY configured:", !!process.env.OPENAI_API_KEY);
console.log("🔵 OPENAI_API_KEY first 10 chars:", process.env.OPENAI_API_KEY?.substring(0, 10));

// Initialize OpenAI only if API key exists
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("✅ OpenAI client initialized");
} else {
  console.log("❌ OPENAI_API_KEY not found in .env file");
}

// POST /api/chat/ask - Send a question and get AI response
// ✅ REMOVED authMiddleware - now public endpoint
router.post("/ask", async (req, res) => {
  console.log("🔵 Chat request received");
  console.log("🔵 Request body:", req.body);
  
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      console.log("🔴 No question provided");
      return res.status(400).json({ error: "Question is required" });
    }

    console.log("🔵 Question:", question);
    console.log("🔵 OpenAI client initialized:", !!openai);

    if (!openai) {
      console.log("🔴 OpenAI client not initialized - missing API key");
      return res.status(500).json({ 
        error: "OpenAI API key not configured. Please add OPENAI_API_KEY to .env file." 
      });
    }

    const systemPrompt = `You are GrowthStageSA's friendly AI assistant. 
    
About GrowthStageSA:
- GrowthStageSA is a South African platform connecting learners to accredited learnerships, internships, and apprenticeships
- We work with SETA-accredited programmes across various industries

What you can help with:
- Explaining how to apply for internships and learnerships
- Guiding users through the application process
- Answering questions about different industries
- Providing general career advice for South African job seekers

Keep your answers:
- Helpful and concise (2-3 sentences when possible)
- Friendly and encouraging
- Focused on South African context`;

    console.log("🔵 Calling OpenAI API...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    console.log("🔵 OpenAI response received");
    const answer = response.choices[0].message.content;
    console.log("🔵 Answer preview:", answer.substring(0, 100));

    res.json({ success: true, answer: answer });

  } catch (error) {
    console.error("🔴 Chat API Error:", error);
    console.error("🔴 Error message:", error.message);
    
    // More detailed error response
    let errorMessage = "Failed to get response from AI. Please try again later.";
    
    if (error.message.includes("API key")) {
      errorMessage = "OpenAI API key is invalid or missing. Please check your .env file.";
    } else if (error.message.includes("quota")) {
      errorMessage = "OpenAI API quota exceeded. Please check your billing details.";
    } else if (error.message.includes("rate limit")) {
      errorMessage = "Too many requests. Please try again in a moment.";
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: error.message 
    });
  }
});

export default router;