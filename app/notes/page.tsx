"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";

type Note = {
  _id: string;
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

  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

  // ✅ Fetch notes only when authenticated
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

  // ✅ Redirect only AFTER session check completes
  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes();
    }
  }, [status, fetchNotes]);

  // ✨ Generate Summary
  const generateSummary = async () => {
    if (!text.trim()) return alert("Enter note first");

    try {
      setLoading(true);

      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setSummary(data.summary || "");
    } catch (error) {
      console.error("Summary failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💾 Save Note
  const saveNote = async () => {
    if (!text.trim()) return alert("Enter note");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          summary,
        }),
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      setText("");
      setSummary("");

      fetchNotes();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  // ⏳ While checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking authentication...
      </div>
    );
  }

  if (!session) return null;

  return (
     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">📝 Notes</h1>

          <p className="text-gray-500 text-sm mt-1">
            Welcome, {session?.user?.name}
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <textarea
            className="w-full h-40 bg-gray-100 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Write your note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={generateSummary}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {loading ? "Summarizing..." : "✨ Summarize"}
            </button>

            <button
              onClick={saveNote}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              💾 Save
            </button>
          </div>

          {summary && (
            <div className="mt-4 bg-gray-100 p-3 rounded-lg text-sm">
              <strong>Summary:</strong> {summary}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mt-6 space-y-4">
          {notesLoading ? (
            <p className="text-center text-gray-500">Loading notes...</p>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note._id}
                className="bg-white p-4 rounded-xl shadow-sm"
              >
                <p className="text-gray-800">{note.content}</p>

                {note.summary && (
                  <div className="mt-2 text-sm text-gray-500">
                    ✨ {note.summary}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}