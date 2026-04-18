"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Note = {
  _id: string;
  content: string;
  summary?: string;
};

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // ✅ Fetch notes ONLY when logged in
  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        console.error("Invalid response:", data);
        setNotes([]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setNotes([]);
    }
  };

 useEffect(() => {
  if (!session) return;

  const loadNotes = async () => {
    try {
      const res = await fetch("/api/notes");

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        console.error("Invalid response:", data);
        setNotes([]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setNotes([]);
    }
  };

  loadNotes();
}, [session, router]);

  // ✨ Generate Summary
  const generateSummary = async () => {
    if (!text) return alert("Enter note first");

    setLoading(true);

    const res = await fetch("/api/ai-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setSummary(data.summary);
    setLoading(false);
  };

  // 💾 Save Note
  const saveNote = async () => {
    if (!text) return alert("Enter note");

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
        router.push("/login");
        return;
      }

      setText("");
      setSummary("");

      await fetchNotes();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // ⛔ Prevent render while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            📝 Notes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome, {session.user?.name}
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <textarea
            className="w-full h-40 bg-gray-100 rounded-lg p-4 mb-4"
            placeholder="Write your note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-3 mb-4">
            <button onClick={generateSummary}>
              {loading ? "Summarizing..." : "✨ Summarize"}
            </button>

            <button onClick={saveNote}>
              💾 Save
            </button>
          </div>

          {summary && (
            <div className="bg-gray-100 p-3 rounded">
              <strong>Summary:</strong> {summary}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mt-6 space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note._id} className="bg-white p-4 rounded-xl shadow">
                <p>{note.content}</p>
                {note.summary && (
                  <div className="text-sm text-gray-500 mt-2">
                    ✨ {note.summary}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No notes yet
            </p>
          )}
        </div>

      </div>
    </div>
  );
}