import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: "AI summary failed" },
      { status: 500 }
    );
  }
}