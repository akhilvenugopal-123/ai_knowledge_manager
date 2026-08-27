import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import {connectDB} from "@/lib/db";
import Note from "@/models/Note";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get ID from URL
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid note ID" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find note belonging to current user
    const note = await Note.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("GET NOTE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}