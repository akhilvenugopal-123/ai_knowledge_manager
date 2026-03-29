import { NextResponse } from "next/server";
import OpenAI from "openai";

// 🔁 Toggle this
const USE_REAL_AI = false;

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

    // 🤖 REAL AI (OpenAI)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Summarize this:\n${text}`,
        },
      ],
    });

    return NextResponse.json({
      summary: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("❌ AI ERROR:", error);

    return NextResponse.json(
      { error: "AI summary failed" },
      { status: 500 }
    );
  }
}