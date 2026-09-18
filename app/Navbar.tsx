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
    <nav className="w-full bg-[#09090b]">
      <div className="flex items-center justify-end px-6 py-4 md:px-8">
        <div className="flex items-center gap-6">
          {/* User */}
          {session?.user && (
            <span className="text-sm text-gray-400">
              Hi,{" "}
              <span className="text-gray-300">
                {session.user.name}
              </span>
            </span>
          )}

          {/* Authentication loading */}
          {status === "loading" ? (
            <span className="text-sm text-gray-500">
              Loading...
            </span>
          ) : session ? (
            <>
              {/* Notes */}
              <button
                type="button"
                onClick={() => router.push("/ai-tools")}
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white cursor-pointer"
              >
                Notes
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-600 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white cursor-pointer"
              >
                Login
              </button>

              {/* Sign Up */}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-purple-700 cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}