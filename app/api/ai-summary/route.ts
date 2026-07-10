import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔁 Toggle this to true to use Google's Free AI
const USE_REAL_AI = true;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // 🧠 MOCK AI (FREE + FAST)
    if (!USE_REAL_AI) {
      const sentences = text.split(".");
      const summary =
        sentences
          .slice(0, 2)
          .join(".")
          .trim() + (sentences.length > 2 ? "." : "");

      return NextResponse.json({ summary });
    }

    // (Google Gemini - Free Tier)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // gemini-2.5-flash is extremely fast and perfect for note summarization
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a clean, concise summary of the following notes:\n\n${text}`,
    });

    return NextResponse.json({
      summary: response.text,
    });

  } catch (error) {
    console.error("❌ AI ERROR:", error);

    return NextResponse.json(
      { error: "AI summary failed" },
      { status: 500 }
    );
  }
}