"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";

type Note = {
  _id: string;
  title?: string;
  content: string;
  summary?: string;
};

export default function NotesPage() {
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  // ==================================================
  // STATE
  // ==================================================

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  // Image processing
  const [imageLoading, setImageLoading] = useState(false);

  // Voice processing
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);

  // Audio file upload
  const [audioFileLoading, setAudioFileLoading] = useState(false);

  // ==================================================
  // REFS
  // ==================================================

  // Image file input
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Audio file input
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Microphone
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ==================================================
  // FETCH NOTES
  // ==================================================

  const fetchNotes = useCallback(async () => {
    try {
      setNotesLoading(true);

      const res = await fetch("/api/notes");

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Fetch notes failed:", error);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes();
    }
  }, [status, fetchNotes]);

  // ==================================================
  // TEXT → SUMMARY
  // ==================================================

  const generateSummary = async () => {
    if (!text.trim()) {
      alert("Enter note first");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          mode: "summarize",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Summary failed");
      }

      setSummary(data.summary || "");
    } catch (error) {
      console.error("Summary failed:", error);
      alert("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // IMAGE → TEXT
  // ==================================================

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    try {
      setImageLoading(true);

      const base64 = await fileToBase64(file);

      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type,
          mode: "extract",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Image processing failed"
        );
      }

      if (data.extractedText) {
        setText((previousText) => {
          if (previousText.trim()) {
            return `${previousText}\n\n${data.extractedText}`;
          }

          return data.extractedText;
        });
      } else {
        alert("No text could be extracted from the image.");
      }
    } catch (error) {
      console.error("Image extraction failed:", error);
      alert("Failed to extract text from image.");
    } finally {
      setImageLoading(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  // ==================================================
  // AUDIO FILE → TEXT
  // ==================================================

  const handleAudioFileClick = () => {
    audioInputRef.current?.click();
  };

  const handleAudioFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Check that selected file is audio
    if (!file.type.startsWith("audio/")) {
      alert(
        "Please select a valid audio file such as MP3, WAV, M4A, OGG, or WEBM."
      );
      return;
    }

    try {
      setAudioFileLoading(true);

      // Convert uploaded audio to Base64
      const base64Audio = await fileToBase64(file);

      console.log("Uploading audio:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: file.type,
          mode: "transcribe",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Audio transcription failed"
        );
      }

      if (data.transcription) {
        setText((previousText) => {
          if (previousText.trim()) {
            return `${previousText}\n\n${data.transcription}`;
          }

          return data.transcription;
        });
      } else {
        alert("No speech could be detected in the audio file.");
      }
    } catch (error) {
      console.error(
        "Audio file transcription failed:",
        error
      );

      alert(
        "Failed to transcribe the audio file. Please make sure the file contains clear speech."
      );
    } finally {
      setAudioFileLoading(false);

      // Reset input so the same audio file can be selected again
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  // ==================================================
  // MICROPHONE → TEXT
  // ==================================================

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert(
          "Audio recording is not supported in this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      let mimeType = "audio/webm";

      // Check browser-supported recording formats
      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType = "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported("audio/webm")
      ) {
        mimeType = "audio/webm";
      } else if (
        MediaRecorder.isTypeSupported("audio/mp4")
      ) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(
        stream,
        { mimeType }
      );

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop microphone
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: mediaRecorder.mimeType || "audio/webm",
          }
        );

        await processAudio(audioBlob);
      };

      mediaRecorder.start();

      setIsRecording(true);
    } catch (error) {
      console.error(
        "Microphone access failed:",
        error
      );

      alert(
        "Microphone access was denied or unavailable. Please allow microphone permission in your browser."
      );
    }
  };

  // ==================================================
  // STOP RECORDING
  // ==================================================

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ==================================================
  // PROCESS MICROPHONE AUDIO
  // ==================================================

  const processAudio = async (audioBlob: Blob) => {
    try {
      setVoiceLoading(true);

      const base64Audio =
        await blobToBase64(audioBlob);

      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType:
            audioBlob.type || "audio/webm",
          mode: "transcribe",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Audio transcription failed"
        );
      }

      if (data.transcription) {
        setText((previousText) => {
          if (previousText.trim()) {
            return `${previousText}\n\n${data.transcription}`;
          }

          return data.transcription;
        });
      } else {
        alert(
          "No speech could be detected in the recording."
        );
      }
    } catch (error) {
      console.error(
        "Voice transcription failed:",
        error
      );

      alert(
        "Failed to transcribe the audio."
      );
    } finally {
      setVoiceLoading(false);
    }
  };

  // ==================================================
  // SAVE NOTE
  // ==================================================

  const saveNote = async () => {
    if (!text.trim()) {
      alert("Enter note");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: text,
          summary,
        }),
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(
          "Failed to save note"
        );
      }

      setTitle("");
      setText("");
      setSummary("");

      fetchNotes();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save note");
    }
  };

  // ==================================================
  // AUTH LOADING
  // ==================================================

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12110f] text-white">
        Checking authentication...
      </div>
    );
  }

  if (!session) return null;

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-[#12110f] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* ==========================================
            WELCOME
        ========================================== */}

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Welcome, {session.user?.name}
          </h1>

          <p className="text-gray-400 mt-2">
            Capture your thoughts and summarize them
            with AI.
          </p>
        </div>

        {/* ==========================================
            EDITOR
        ========================================== */}

        <div className="rounded-3xl border border-[#2b2b2b] bg-[#1b1a17] overflow-hidden shadow-xl">

          {/* TITLE */}

          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full bg-transparent px-8 py-6 text-3xl font-semibold border-b border-[#2b2b2b] outline-none placeholder:text-gray-500"
          />

          {/* ========================================
              INPUT METHOD TOOLBAR
          ======================================== */}

          <div className="flex flex-wrap items-center gap-3 px-8 py-4 border-b border-[#2b2b2b] bg-[#181714]">

            {/* --------------------------------
                IMAGE FILE INPUT
            -------------------------------- */}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* IMAGE → TEXT */}

            <button
              type="button"
              onClick={handleImageClick}
              disabled={imageLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#3a382f] bg-[#211f1a] text-gray-300 hover:border-yellow-600 hover:text-yellow-400 hover:bg-yellow-600/10 transition disabled:opacity-50"
            >
              <span className="text-lg">
                🖼️
              </span>

              <span>
                {imageLoading
                  ? "Extracting..."
                  : "Image to text"}
              </span>
            </button>

            {/* --------------------------------
                AUDIO FILE INPUT
            -------------------------------- */}

            <input
              ref={audioInputRef}
              type="file"
              accept="
                audio/mpeg,
                audio/mp3,
                audio/wav,
                audio/x-wav,
                audio/mp4,
                audio/m4a,
                audio/ogg,
                audio/webm,
                audio/*"
              onChange={handleAudioFileUpload}
              className="hidden"
            />

            {/* AUDIO FILE → TEXT */}

            <button
              type="button"
              onClick={handleAudioFileClick}
              disabled={
                audioFileLoading ||
                voiceLoading ||
                isRecording
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#3a382f] bg-[#211f1a] text-gray-300 hover:border-yellow-600 hover:text-yellow-400 hover:bg-yellow-600/10 transition disabled:opacity-50"
            >
              <span className="text-lg">
                🎵
              </span>

              <span>
                {audioFileLoading
                  ? "Transcribing..."
                  : "Upload audio"}
              </span>
            </button>

            {/* --------------------------------
                MICROPHONE
            -------------------------------- */}

            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={
                  voiceLoading ||
                  audioFileLoading
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#3a382f] bg-[#211f1a] text-gray-300 hover:border-yellow-600 hover:text-yellow-400 hover:bg-yellow-600/10 transition disabled:opacity-50"
              >
                <span className="text-lg">
                  🎙️
                </span>

                <span>
                  {voiceLoading
                    ? "Transcribing..."
                    : "Voice to text"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
              >
                <span className="animate-pulse">
                  🔴
                </span>

                <span>
                  Stop recording
                </span>
              </button>
            )}

            {/* RECORDING INDICATOR */}

            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

                Recording...
              </div>
            )}

            {/* AUDIO FILE PROCESSING */}

            {audioFileLoading && (
              <div className="text-sm text-gray-500">
                Processing uploaded audio...
              </div>
            )}

            {/* MICROPHONE PROCESSING */}

            {voiceLoading && (
              <div className="text-sm text-gray-500">
                Processing your voice...
              </div>
            )}
          </div>

          {/* ========================================
              TEXT AREA
          ======================================== */}

          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder="Paste or write your note here..."
            className="w-full h-80 bg-transparent resize-none outline-none px-8 py-6 text-gray-300 placeholder:text-gray-500"
          />

          {/* ========================================
              EDITOR FOOTER
          ======================================== */}

          <div className="flex justify-between items-center border-t border-[#2b2b2b] px-8 py-5">

            {/* SUMMARISE */}

            <button
              onClick={generateSummary}
              disabled={
                loading || !text.trim()
              }
              className="px-6 py-2 rounded-xl border border-yellow-700 text-yellow-400 hover:bg-yellow-700/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? "Summarising..."
                : "✨ Summarise"}
            </button>

            {/* WORD COUNT */}

            <div className="text-gray-500 text-sm">
              {
                text
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .length
              }{" "}
              words
            </div>

            {/* SAVE */}

            <button
              onClick={saveNote}
              disabled={!text.trim()}
              className="px-6 py-2 rounded-xl bg-yellow-600 text-black font-semibold hover:bg-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save note
            </button>
          </div>

          {/* ========================================
              SUMMARY
          ======================================== */}

          {summary && (
            <div className="border-t border-[#2b2b2b] bg-[#22201c] p-8">

              <div className="uppercase tracking-widest text-xs text-yellow-500 mb-4">
                Summary
              </div>

              <p className="text-gray-300 leading-7">
                {summary}
              </p>

            </div>
          )}

        </div>

        {/* ==========================================
            SAVED NOTES HEADER
        ========================================== */}

        <div className="flex justify-between items-center mt-14 mb-8">

          <h2 className="text-3xl font-bold">
            Saved notes

            <span className="text-gray-500 ml-3 text-xl">
              {notes.length}
            </span>
          </h2>

        </div>

        {/* ==========================================
            NOTES
        ========================================== */}

        {notesLoading ? (

          <div className="text-center text-gray-500 py-16">
            Loading notes...
          </div>

        ) : notes.length === 0 ? (

          <div className="text-center text-gray-500 py-16">
            No notes yet.
          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

            {notes.map((note) => (

              <div
                key={note._id}
                onClick={() => router.push(`/note/${note._id}`)}
                className="rounded-2xl overflow-hidden border border-[#1e1e30] bg-[#10101a] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#13131f] hover:shadow-[0_20px_60px_rgba(124,58,237,0.12)] cursor-pointer"
              >

                {/* NOTE CONTENT */}

                <div className="p-7">

                  <div className="flex items-center gap-2 mb-4">

                    <span className="text-yellow-500">
                      ◈
                    </span>

                    <h3 className="text-2xl font-bold">
                      {note.title ||
                        "Untitled Note"}
                    </h3>

                  </div>

                  <p className="text-gray-400 line-clamp-5 leading-7">
                    {note.content}
                  </p>

                </div>

                {/* SUMMARY */}

                {note.summary && (

                  <div className="border-t border-[#2b2b2b] bg-[#22201c] p-6">

                    <div className="uppercase tracking-widest text-xs text-yellow-500 mb-3">
                      ✨ Summary
                    </div>

                    <p className="italic text-gray-300 leading-7 line-clamp-5">
                      {note.summary}
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </main>
    </div>
  );
}

// ==================================================
// HELPER: FILE → BASE64
// ==================================================

function fileToBase64(
  file: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(
        new Error("Failed to read file")
      );
    };

    reader.readAsDataURL(file);
  });
}

// ==================================================
// HELPER: BLOB → BASE64
// ==================================================

function blobToBase64(
  blob: Blob
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(
        new Error("Failed to convert audio")
      );
    };

    reader.readAsDataURL(blob);
  });
}