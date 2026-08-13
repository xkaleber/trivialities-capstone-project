import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

// ==========================================
// 🛡️ CRITICAL SYSTEM ENVIRONMENT CHECK
// ==========================================
// WHY: NextAuth uses this secret key to sign and encrypt JSON Web Tokens (JWTs).
// If this variable is missing in production, authentication tokens could be easily forged.
// This early return instantly crashes the build/server to prevent running in an insecure state.
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("CRITICAL SECURITY ERROR: NEXTAUTH_SECRET environment variable is missing!");
}

// ==========================================
// ⚙️ NEXTAUTH CONFIGURATION OPTIONS
// ==========================================
export const authOptions = {
  // 1. PROVIDERS CONFIGURATION
  // WHY: Defines the authentication methods available to the application.
  providers: [
    CredentialsProvider({
      name: "Credentials", // The baseline display name used in default NextAuth form fallback screens
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      
      // THE VALIDATION PIPELINE
      // WHY: This custom method intercepts login submissions and determines if the user gets access.
      async authorize(credentials) {
        // Step A: Early validation boundary to make sure both forms aren't empty strings
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        // Step B: Connect to MongoDB 
        // WHY: Database connections in serverless environments can spin down between calls; 
        // this ensures the connection pool is open before querying.
        await connectDB();

        // Step C: Look up user accounts inside MongoDB
        // WHY: Users might accidentally capitalize letters when typing emails. 
        // Converting input to lowercase ensures uniform lookup matching how it was saved during registration.
        const user = await User.findOne({ 
          email: credentials.email.toLowerCase(), 
        });

        // Step D: Account availability protection check
        if (!user) {
          throw new Error("No account found with that email address.");
        }

        // Step E: Password cryptographic evaluation
        // WHY: Passwords are encrypted as strong hashes in the database using salt factors. 
        // Bcrypt securely decrypts and compares the raw text password string against the database hash.
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password string entered.");
        }

        // Step F: Package validated pipeline data
        // WHY: If verification succeeds, this payload object gets packaged and forwarded directly 
        // down to the JWT/Session callbacks below. MongoDB objectIDs are converted to explicit strings.
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],

  // 2. LIFECYCLE CALLBACK FUNCTIONS
  // WHY: NextAuth runs data through a step-by-step pipeline. We must explicitly tell it to pass
  // custom values (like database user IDs) down from the initial authorize step into client cookies.
  callbacks: {
    // Pipeline Step 1: JWT Generation Callback
    // WHY: Fired right after authentication. If the 'user' object exists from the authorize method,
    // we attach its custom string ID directly to the secure JSON Web Token payload state.
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    // Pipeline Step 2: Session Context Construction Callback
    // WHY: Fired whenever the client application calls 'useSession()' or gets session updates.
    // This reads the custom ID parameter out of the encrypted JWT token and mounts it onto 
    // 'session.user.id' so the front-end components can grab it easily.
    async session({ session, token }: { session: any; token: any }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },

  // 3. ARCHITECTURE REDIRECT ROUTING
  // WHY: Overrides standard NextAuth default generic login view overlays. 
  // If an unauthenticated user attempts to view a protected dashboard route, they are dynamically 
  // redirected straight to the custom interface route layout at '/auth'.
  pages: {
    signIn: "/auth", // 👇 Redirects players to single /auth unified view page
  },

  // 4. INFRASTRUCTURE & CRYPTOGRAPHY CONTROLS
  secret: process.env.NEXTAUTH_SECRET, // ✨ Safe: no fallback string sitting in public code
  
  // WHY: 'as const' locks down the strict literal TypeScript type value checking.
  // NextAuth will read user cookies entirely via statutory stateless encrypted JSON Web Tokens
  // rather than making expensive database sessions inquiries on every asset fetch.
  session: { strategy: "jwt" as const },
};

// ==========================================
// 🚀 INBOUND API HANDLER EXPORTS
// ==========================================
// WHY: Next.js App Router API Route definitions require explicit HTTP method configurations.
// This wraps the authOptions setup engine and maps it directly onto inbound GET and POST requests.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
