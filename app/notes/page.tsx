"use client";

import { useEffect, useState, useCallback } from "react";
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

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);

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
      console.error(error);
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

  const generateSummary = async () => {
    if (!text.trim()) {
      alert("Enter note first");
      return;
    }

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

      setTitle("");
      setText("");
      setSummary("");

      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111] text-white">
        Checking authentication...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#12110f] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* Welcome */}

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Welcome, {session.user?.name}
          </h1>

          <p className="text-gray-400 mt-2">
            Capture your thoughts and summarize them with AI.
          </p>
        </div>

        {/* Editor */}

        <div className="rounded-3xl border border-[#2b2b2b] bg-[#1b1a17] overflow-hidden shadow-xl">

          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent px-8 py-6 text-3xl font-semibold border-b border-[#2b2b2b] outline-none placeholder:text-gray-500"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write your note here..."
            className="w-full h-80 bg-transparent resize-none outline-none px-8 py-6 text-gray-300 placeholder:text-gray-500"
          />

          <div className="flex justify-between items-center border-t border-[#2b2b2b] px-8 py-5">

            <button
              onClick={generateSummary}
              className="px-6 py-2 rounded-xl border border-yellow-700 text-yellow-400 hover:bg-yellow-700/20 transition"
            >
              {loading ? "Summarising..." : "✨ Summarise"}
            </button>

            <div className="text-gray-500 text-sm">
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </div>

            <button
              onClick={saveNote}
              className="px-6 py-2 rounded-xl bg-yellow-600 text-black font-semibold hover:bg-yellow-500 transition"
            >
              Save note
            </button>

          </div>

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

        {/* Saved Notes */}

        <div className="flex justify-between items-center mt-14 mb-8">

          <h2 className="text-3xl font-bold">
            Saved notes

            <span className="text-gray-500 ml-3 text-xl">
              {notes.length}
            </span>
          </h2>

        </div>

        {/* Cards */}

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
                className="rounded-2xl overflow-hidden border border-[#2b2b2b] bg-[#1b1a17] hover:border-yellow-700 transition-all duration-300"
              >

                <div className="p-6">

                  <h3 className="text-2xl font-bold mb-5">
                    {note.title || "Untitled Note"}
                  </h3>

                  <p className="text-gray-400 line-clamp-5 leading-7">
                    {note.content}
                  </p>

                </div>

                {note.summary && (

                  <div className="border-t border-[#2b2b2b] bg-[#22201c] p-6">

                    <div className="uppercase tracking-widest text-xs text-yellow-500 mb-3">
                      Summary
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