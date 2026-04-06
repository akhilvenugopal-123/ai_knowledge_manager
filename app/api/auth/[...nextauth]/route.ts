import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ✅ Define credentials type
type Credentials = {
  email: string;
  password: string;
};

// ✅ Properly typed auth options
export const authOptions: NextAuthOptions = {
  providers: [
    // 🔐 Credentials Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: Credentials | undefined) {
        // ✅ Validate input safely
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email,
        });

        if (!user) {
          throw new Error("No user found");
        }

        // ❌ Prevent Google users using password
        if (!user.password) {
          throw new Error("Use Google login");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isMatch) {
          throw new Error("Wrong password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),

    // 🌐 Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // 🧠 JWT session
  session: {
    strategy: "jwt",
  },

  // 🔁 Callbacks
  callbacks: {
    // 🔥 Handle Google signup/login
    async signIn({ user, account }): Promise<boolean> {
      await connectDB();

      if (account?.provider === "google") {
        const existingUser = await User.findOne({
          email: user.email,
        });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
          });
        }
      }

      return true;
    },

    // 🔐 Attach user id to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Ensure ID exists for Google users
      if (!token.id && token.email) {
        await connectDB();

        const dbUser = await User.findOne({
          email: token.email,
        });

        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }

      return token;
    },

    // 📦 Attach user id to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },

  // 🔐 Secret
  secret: process.env.NEXTAUTH_SECRET,

  // 🔁 Custom login page
  pages: {
    signIn: "/login",
  },
};

// 🚀 NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };