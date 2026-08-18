import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔁 Toggle this to true to use Google's Free AI
const USE_REAL_AI = true;

export async function POST(req: Request) {
  try {
    const {
      text,
      image,
      audio,
      mimeType,
      mode = "both", // Modes: 'extract'/'transcribe', 'summarize', or 'both'
    } = await req.json();

    // 1. Validation check
    if (!text && !image && !audio) {
      return NextResponse.json(
        { error: "Provide 'text', 'image', or 'audio' payload." },
        { status: 400 }
      );
    }

    // 🧠 MOCK AI (FREE + FAST)
    if (!USE_REAL_AI) {
      if (image) {
        return NextResponse.json({
          extractedText: "Sample extracted text from the document image. (Mock Data)",
          summary: "Summary of the content extracted from the image. (Mock Data)",
        });
      }
      if (audio) {
        return NextResponse.json({
          transcription: "Sample transcript from audio recording. (Mock Data)",
          summary: "Sample summary of the audio content. (Mock Data)",
        });
      }

      const sentences = text.split(".");
      const summary =
        sentences
          .slice(0, 2)
          .join(".")
          .trim() + (sentences.length > 2 ? "." : "");

      return NextResponse.json({ summary });
    }

    // 🤖 REAL AI (Google Gemini - Free Tier)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // --- CASE A: Image Text Extraction & Optional Summarization ---
    if (image) {
      const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

      let prompt = "";
      if (mode === "extract") {
        prompt = "Extract and return all the text from this image exactly as written. Do not add commentary.";
      } else if (mode === "summarize") {
        prompt = "Provide a clean, concise summary of the text present in this image.";
      } else {
        prompt = `
          Perform two tasks on this image:
          1. Extract all text from the image exactly as written.
          2. Provide a clean, concise summary of the extracted text.

          Format your response strictly as a JSON object with keys "extractedText" and "summary":
          {
            "extractedText": "...",
            "summary": "..."
          }
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: base64Image,
            },
          },
          prompt,
        ],
      });

      if (mode === "both") {
        try {
          if (!response.text) {
            throw new Error("Empty response from AI model");
          }

          const cleanedText = response.text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          return NextResponse.json(parsed);
        } catch (err) {
          console.error("JSON Parsing Error:", err);
          return NextResponse.json({ rawOutput: response.text ?? "" });
        }
      }

      return NextResponse.json({
        [mode === "summarize" ? "summary" : "extractedText"]: response.text,
      });
    }

    // --- CASE B: Voice / Audio Processing ---
    if (audio) {
      const base64Audio = audio.replace(/^data:audio\/\w+;base64,/, "");

      let prompt = "";
      if (mode === "transcribe") {
        prompt = "Transcribe the audio speech accurately into text. Do not add commentary.";
      } else if (mode === "summarize") {
        prompt = "Provide a clean, concise summary of the key points spoken in this audio.";
      } else {
        prompt = `
          Perform two tasks on this audio recording:
          1. Transcribe the speech completely into text.
          2. Provide a concise summary of the points discussed.

          Format your response strictly as a JSON object with keys "transcription" and "summary":
          {
            "transcription": "...",
            "summary": "..."
          }
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "audio/mp3",
              data: base64Audio,
            },
          },
          prompt,
        ],
      });

     if (mode === "both") {
        // Extract response text safely with a fallback string
        const rawText = response.text ?? "";

        try {
          if (!rawText) {
            throw new Error("Empty response received from AI model");
          }

          const cleanedText = rawText.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          return NextResponse.json(parsed);
        } catch (err) {
          console.error("JSON Parsing Error:", err);
          return NextResponse.json({ rawOutput: rawText });
        }
      }

      return NextResponse.json({
        [mode === "summarize" ? "summary" : "transcription"]: response.text,
      });
    }

    // --- CASE C: Plain Text Summarization ---
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a clean, concise summary of the following notes:\n\n${text}`,
    });

    return NextResponse.json({ summary: response.text });

  } catch (error) {
    console.error("❌ AI ERROR:", error);

    return NextResponse.json(
      { error: "AI processing failed" },
      { status: 500 }
    );
  }
}