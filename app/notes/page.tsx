"use client";

import { useEffect, useState } from "react";

type Note = {
  _id: string;
  content: string;
  summary?: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch notes
 const fetchNotes = async () => {
  try {
    const res = await fetch("/api/notes");
    const data = await res.json();

    console.log("API response:", data); // debug

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
  const loadNotes = async () => {
    try {
      const res = await fetch("/api/notes");
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
}, []);

  // Generate AI Summary
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

  // Save Note
  const saveNote = async () => {
    if (!text) return alert("Enter note");

    try {
        await fetch("/api/notes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: text,
            summary,
        }),
        });

        setText("");
        setSummary("");

        await fetchNotes(); // ensure fresh data
    } catch (err) {
        console.error("Save failed:", err);
    }
    };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
  <div className="w-full max-w-3xl">

    {/* Header */}
    <div className="text-center mb-6">
      <h1 className="text-3xl font-semibold text-gray-800 flex items-center justify-center gap-2">
        📝 Notes
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Capture your thoughts and ideas
      </p>
    </div>

    {/* Main Card */}
    <div className="bg-white rounded-2xl shadow-lg p-6">

      {/* Section Title */}
      <h2 className="text-sm font-medium text-gray-700 mb-2">
        Your Notes
      </h2>

      {/* Textarea */}
      <textarea
        className="w-full h-40 bg-gray-100 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 mb-4 resize-none"
        placeholder="Start writing your notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={generateSummary}
          className="flex items-center gap-2 bg-linear-to-r from-purple-400 to-indigo-400 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition"
        >
          ✨ {loading ? "Summarizing..." : "Summarize with AI"}
        </button>

        <button
          onClick={saveNote}
          className="flex items-center gap-2 bg-linear-to-r from-lime-400 to-green-500 text-white px-4 py-2 rounded-lg hover:from-lime-500 hover:to-green-600 transition"
        >
          💾 Save Note
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700">
          <span className="font-semibold">Summary:</span> {summary}
        </div>
      )}
    </div>

    {/* Notes List */}
    <div className="mt-6 grid gap-4">
      {Array.isArray(notes) && notes.length > 0 ? (
        notes.map((note) => (
          <div
            key={note._id}
            className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition"
          >
            <p className="text-gray-800 text-sm mb-2">
              {note.content}
            </p>

            {note.summary && (
              <div className="text-xs text-gray-500 border-t pt-2">
                <strong>Summary:</strong> {note.summary}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 text-sm">
          No notes yet
        </p>
      )}
    </div>

  </div>
</div>
  );
}