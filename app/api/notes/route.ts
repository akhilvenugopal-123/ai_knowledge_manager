import { connectDB } from "@/lib/db";
import Note from "@/models/Note";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const note = await Note.create(body);

  return NextResponse.json(note);
}

export async function GET() {
  await connectDB();

  const notes = await Note.find();

  return NextResponse.json(notes);
}