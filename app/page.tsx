"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Navbar from "./Navbar";

const features = [
  {
    icon: "✦",
    title: "Smart Notes",
    description:
      "Write and organize your notes with intelligent structure and tagging.",
  },
  {
    icon: "◈",
    title: "AI Summaries",
    description:
      "Instantly turn your notes into clear, concise summaries using AI.",
  },
  {
    icon: "◎",
    title: "Image to Text",
    description:
      "Extract and digitize text from images automatically.",
    soon: true,
  },
];

function StarField() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-40"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 60 }).map((_, i) => (
        <circle
          key={i}
          cx={`${(i * 137.5) % 100}%`}
          cy={`${(i * 97.3) % 100}%`}
          r={i % 5 === 0 ? 1.2 : 0.6}
          fill="white"
          opacity={0.3 + (i % 4) * 0.15}
        />
      ))}
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const mask = `radial-gradient(
    circle at ${cursor.x}px ${cursor.y}px,
    rgba(124, 58, 237, 0.18) 80px,
    transparent 160px
  )`;

  return (
    <div className="min-h-screen overflow-hidden bg-[#08080f] text-white">
      {/* Navbar */}
      <div
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-violet-500/15 bg-[#08080f]/85 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <Navbar />
      </div>

      {/* Hero */}
      <section
        className="relative min-h-screen overflow-hidden bg-[#08080f]"
        onPointerEnter={() => setHovering(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovering(false)}
      >
        {/* Stars */}
        <StarField />

        {/* Base dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(124,58,237,0.22) 1px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Interactive dot grid */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(139,92,246,0.55) 1.8px, transparent 2px)",
            backgroundSize: "22px 22px",
            opacity: hovering ? 1 : 0,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />

        {/* Main purple glow */}
        <div className="pointer-events-none absolute left-1/2 top-[35%] h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

        {/* Hero content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
          {/* Badge */}
          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.8)]" />

            <span className="text-xs font-medium tracking-[0.15em] text-violet-300">
              AI-POWERED NOTE TAKING
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] text-[#f0f0fa] sm:text-6xl md:text-7xl">
            Capture, Summarize{" "}
            <span className="bg-gradient-to-br from-violet-600 to-violet-300 bg-clip-text text-transparent">
              & Organize
            </span>{" "}
            Your Notes with AI
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-7 text-[#6b6b80] sm:text-lg">
            Turn your thoughts into structured knowledge instantly. Write
            notes, generate summaries, and soon extract text from images —
            all in one place.
          </p>

          {/* CTA */}
          <button
            onClick={() => router.push("/ai-tools")}
            className="group mt-10 inline-flex items-center gap-2.5 rounded-xl bg-linear-to-br from-violet-600 to-violet-700 px-9 py-3.5 text-base font-semibold text-white shadow-[0_0_40px_rgba(124,58,237,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(124,58,237,0.55)]"
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              🚀
            </span>

            Start Writing Notes
          </button>

          {/* Scroll indicator */}
          <button
            onClick={() => {
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[#3a3a50] transition-colors hover:text-violet-400"
          >
            <span className="text-[10px] tracking-[0.2em]">
              SCROLL
            </span>

            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
            >
              <rect
                x="6.5"
                y="1"
                width="3"
                height="8"
                rx="1.5"
                fill="currentColor"
              />

              <path
                d="M3 12L8 17L13 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-violet-500/10 bg-[#08080f] px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.15em] text-[#3a3a50]">
            What you get
          </p>

          <h2 className="mb-14 text-center text-3xl font-bold tracking-[-0.03em] text-[#e8e8f0] sm:text-4xl">
            Everything you need to think clearly
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-[#1e1e30] bg-[#10101a] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#13131f] hover:shadow-[0_20px_60px_rgba(124,58,237,0.12)]"
              >
                {/* Card glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Icon */}
                <div className="relative mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-xl text-violet-400">
                  {feature.icon}
                </div>

                <div className="relative flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[#e8e8f0]">
                    {feature.title}
                  </h3>

                  {feature.soon && (
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-300">
                      Soon
                    </span>
                  )}
                </div>

                <p className="relative mt-3 text-sm leading-6 text-[#6b6b80]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative overflow-hidden border-t border-violet-500/10 bg-[#08080f] px-6 py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#e8e8f0] sm:text-4xl">
            Turn your thoughts into knowledge.
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#6b6b80] sm:text-base">
            Stop letting important ideas get lost. Capture them, summarize
            them, and keep everything organized in one intelligent workspace.
          </p>

          <button
            onClick={() => router.push("/ai-tools")}
            className="mt-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-7 py-3 text-sm font-semibold text-white shadow-[0_0_35px_rgba(124,58,237,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(124,58,237,0.5)]"
          >
            Open My Notes →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e30] bg-[#08080f] px-6 py-8 text-center">
        <p className="text-xs text-[#3a3a50]">
          © {new Date().getFullYear()} AI Notes. Built with Next.js 🚀
        </p>
      </footer>
    </div>
  );
}

