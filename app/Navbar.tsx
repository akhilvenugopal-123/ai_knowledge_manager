"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        className="text-xl font-semibold"
      >
        AI Notes
      </button>

      <div className="flex items-center gap-3">
        {session?.user && (
          <span className="text-gray-600 text-sm">
            Hi, {session.user.name}
          </span>
        )}

        {status === "loading" ? (
          <div className="text-gray-500 text-sm">
            Loading...
          </div>
        ) : session ? (
          <>
            <button
              onClick={() => router.push("/notes")}
              className="text-gray-600 hover:text-black"
            >
              Notes
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/login")}
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/register")}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}