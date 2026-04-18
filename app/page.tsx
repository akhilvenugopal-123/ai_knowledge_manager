"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">

      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold">AI Notes</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/login")}
            className="text-gray-600 hover:text-black"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/register")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-3xl text-center">

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Capture, Summarize & Organize Your Notes with AI
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            Turn your thoughts into structured knowledge instantly.
            Write notes, generate summaries, and soon extract text from images — all in one place.
          </p>

          {/* CTA */}
          <button
            onClick={() => router.push("/notes")}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-purple-700 transition"
          >
            🚀 Start Writing Notes
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">

          <div className="p-6 rounded-xl border shadow-sm text-center">
            <h3 className="font-semibold text-lg mb-2">📝 Smart Notes</h3>
            <p className="text-gray-500 text-sm">
              Write and organize your notes effortlessly.
            </p>
          </div>

          <div className="p-6 rounded-xl border shadow-sm text-center">
            <h3 className="font-semibold text-lg mb-2">✨ AI Summaries</h3>
            <p className="text-gray-500 text-sm">
              Instantly generate summaries using AI.
            </p>
          </div>

          <div className="p-6 rounded-xl border shadow-sm text-center">
            <h3 className="font-semibold text-lg mb-2">📸 Image to Text</h3>
            <p className="text-gray-500 text-sm">
              Extract text from images (coming soon).
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4">
        © {new Date().getFullYear()} AI Notes. Built with Next.js 🚀
      </div>
    </div>
  );
}