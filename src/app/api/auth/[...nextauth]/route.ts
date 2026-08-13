import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

// ✨ Enforce environment variable security check
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("CRITICAL SECURITY ERROR: NEXTAUTH_SECRET environment variable is missing!");
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        // 1. Establish a database connection using helper
        await connectDB();

        // 2. Locate the user by email using User model
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          throw new Error("No account found with that email address.");
        }

        // 3. Verify the password against custom database field (passwordHash)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password string entered.");
        }

        // 4. Return user profile details down to NextAuth session layers
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth", // 👇 Redirects players to single /auth unified view page
  },
  secret: process.env.NEXTAUTH_SECRET, // ✨ Safe: no fallback string sitting in public code
  session: { strategy: "jwt" as const },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
