import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // later: handle file upload
    return NextResponse.json({
      message: "Upload endpoint (to be implemented)",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}