"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../Navbar";

type Note = {
  _id: string;
  title?: string;
  content: string;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchNote = async () => {
      try {
        setLoading(true);
        setError("");

        const id = params?.id;

        if (!id || typeof id !== "string") {
          setError("Invalid note ID.");
          return;
        }

        const res = await fetch(`/api/notes/${id}`);

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        if (res.status === 404) {
          setError("Note not found.");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch note");
        }

        const data = await res.json();

        setNote(data);
      } catch (error) {
        console.error("Failed to fetch note:", error);
        setError("Unable to load this note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [status, params, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#12110f] text-white">
        <Navbar />

        <main className="max-w-5xl mx-auto px-8 py-16">
          <div className="animate-pulse">
            <div className="h-10 w-2/3 bg-[#24231f] rounded-lg mb-6" />
            <div className="h-4 w-1/3 bg-[#24231f] rounded-lg mb-12" />

            <div className="rounded-3xl border border-[#2b2b2b] bg-[#1b1a17] p-8">
              <div className="space-y-4">
                <div className="h-4 bg-[#24231f] rounded w-full" />
                <div className="h-4 bg-[#24231f] rounded w-11/12" />
                <div className="h-4 bg-[#24231f] rounded w-10/12" />
                <div className="h-4 bg-[#24231f] rounded w-9/12" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#12110f] text-white">
        <Navbar />

        <main className="max-w-5xl mx-auto px-8 py-16">
          <button
            onClick={() => router.back()}
            className="mb-8 text-sm text-gray-400 hover:text-white transition"
          >
            ← Back to notes
          </button>

          <div className="rounded-3xl border border-[#2b2b2b] bg-[#1b1a17] p-10 text-center">
            <div className="text-5xl mb-5">📝</div>

            <h1 className="text-2xl font-semibold mb-3">
              {error || "Note not found"}
            </h1>

            <p className="text-gray-500">
              This note may have been deleted or is no longer available.
            </p>

            <button
              onClick={() => router.push("/ai-tools")}
              className="mt-7 px-6 py-3 rounded-xl bg-yellow-600 text-black font-semibold hover:bg-yellow-500 transition"
            >
              Back to AI Tools
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12110f] text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10">

        {/* Back */}
        <button
          onClick={() => router.push("/ai-tools")}
          className="mb-8 text-sm text-gray-400 hover:text-yellow-400 transition"
        >
          ← Back to saved notes
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-yellow-500 mb-4">
            Saved Note
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {note.title || "Untitled Note"}
          </h1>

          {note.createdAt && (
            <p className="mt-4 text-sm text-gray-500">
              Created{" "}
              {new Date(note.createdAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Full Note */}
        <section className="rounded-3xl border border-[#2b2b2b] bg-[#1b1a17] overflow-hidden shadow-xl">

          <div className="px-8 py-6 border-b border-[#2b2b2b]">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Note content
            </div>
          </div>

          <div className="px-8 py-8 md:px-10 md:py-10">
            <div className="whitespace-pre-wrap text-gray-300 text-lg leading-8">
              {note.content}
            </div>
          </div>

        </section>

        {/* Summary */}
        {note.summary && (
          <section className="mt-8 rounded-3xl border border-yellow-700/30 bg-[#1d1b16] overflow-hidden">

            <div className="px-8 py-6 border-b border-yellow-700/20">
              <div className="uppercase tracking-[0.2em] text-xs text-yellow-500">
                AI Summary
              </div>
            </div>

            <div className="px-8 py-8 md:px-10 md:py-10">
              <p className="whitespace-pre-wrap text-gray-300 text-lg leading-8">
                {note.summary}
              </p>
            </div>

          </section>
        )}

        {/* Bottom navigation */}
        <div className="flex justify-between items-center mt-10">

          <button
            onClick={() => router.push("/ai-tools")}
            className="px-5 py-3 rounded-xl border border-[#333] text-gray-300 hover:bg-[#1b1a17] hover:text-white transition"
          >
            ← All notes
          </button>

          <div className="text-sm text-gray-600">
            AI Knowledge Manager
          </div>

        </div>

      </main>
    </div>
  );
}