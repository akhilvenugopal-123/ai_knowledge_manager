import { connectDB } from "@/lib/db";
import Note from "@/models/Note";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


// ✅ CREATE NOTE (Protected)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // ❌ Block unauthenticated users
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { content, summary } = await req.json();

    const note = await Note.create({
      content,
      summary,
      userId: session.user.id, // 🔥 link note to user
    });

    return NextResponse.json(note);

  } catch (error) {
    console.error("POST /api/notes error:", error);

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}


// ✅ GET NOTES (Only user's notes)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // ❌ Block unauthenticated users
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const notes = await Note.find({
      userId: session.user.id, // 🔥 only this user's notes
    }).sort({ createdAt: -1 });

    return NextResponse.json(notes || []);

  } catch (error) {
    console.error("GET /api/notes error:", error);

    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}