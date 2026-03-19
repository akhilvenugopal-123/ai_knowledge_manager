import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { text } = body;

    // temporary mock response (to fix build)
    return NextResponse.json({
      summary: `Summary of: ${text}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}