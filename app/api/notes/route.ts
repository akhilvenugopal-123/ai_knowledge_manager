import { connectDB } from "@/lib/db";
import Note from "@/models/Note";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { content, summary } = await req.json();

    const note = await Note.create({
      content,
      summary,
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const notes = await Note.find().sort({ createdAt: -1 });

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}