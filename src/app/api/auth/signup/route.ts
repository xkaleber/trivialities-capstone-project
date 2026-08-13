import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword } from "@/helpers/auth";

// ========================================================
// 🚀 INBOUND HTTP POST REGISTRATION HANDLER
// ========================================================
// WHY: Next.js App Router uses explicit named HTTP function exports (POST, GET, etc.). 
// This function catches inbound player sign-up requests, processes them, and records them to the database.
export async function POST(request: Request) {
  try {
    // Step 1: Open Mongoose Connection Pool
    // WHY: Serverless functions spin down when idle. We call this initialization helper 
    // at the top of the route to guarantee a healthy connection state before handling database writes.
    await connectDB();

    // Step 2: Unpack JSON Request Body
    // WHY: Reads raw incoming stream data transmitted from the client sign-up form components.
    const { username, email, password } = await request.json();

    // ==========================================
    // 🛑 PHASE 1: DATA INTEGRITY VALIDATION
    // ==========================================
    
    // Check A: Empty String Null Check
    // WHY: Rejects malicious, incomplete, or corrupted API payloads that bypass client-side form validation.
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }, // 400 Bad Request: Indicates a client-side format issue
      );
    }

    // Check B: Minimum Password Complexity Length Check
    // WHY: Protects user accounts from easily guessable credentials and automated brute-force attacks.
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // ==========================================
    // 🔍 PHASE 2: UNIQUE ACCOUNT IDENTIFICATION
    // ==========================================
    // WHY: Query the database using a MongoDB '$or' conditional operator block. 
    // This allows us to sweep for duplicate emails or matching usernames in a single round-trip.
    // .toLowerCase() and .trim() normalize the text inputs so user variations don't break lookup systems.
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() }, 
        { username: username.trim() }
      ],
    });

    // Rejection Trigger: Account Collisions Detained
    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already registered" },
        { status: 400 },
      );
    }

    // ==========================================
    // 🔐 PHASE 3: SECURE CREDENTIAL SALTING
    // ==========================================
    // WHY: Storing raw text passwords inside a database is an extreme security liability. 
    // This passes the raw password string to a crypto abstraction helper (typically utilizing bcrypt)
    // to transform it into an irreversible cryptographic hash before database storage.
    const passwordHash = await hashPassword(password);

    // ==========================================
    // 📝 PHASE 4: SCHEMA DOCUMENT SCHEDULING
    // ==========================================
    // WHY: Instantiates a fresh Mongoose Document mapping the secure variables onto the model definition.
    // Explicitly assigning default structural schemas prevents null evaluation errors later during gameplay queries.
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      gamesPlayed: 0, // Explicit zero baseline initialization
      highScore: 0,   // Explicit zero baseline initialization
      statsByCategory: {}, // Empty map initialization prevents frontend mapping failures on fresh accounts
      
      // ✨ Force initialization of the nested difficulties structure
      // WHY: Hardcoding this nested layout ensures that subsequent game summary routines 
      // can safely update properties (like statsByDifficulty.medium.total++) without encountering 'undefined' errors.
      statsByDifficulty: {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      },
    });

    // Step 5: Save Record changes to MongoDB Engine Atlas clusters
    await newUser.save();

    // Step 6: Inform the frontend of a clean creation cycle
    return NextResponse.json(
      { message: "User registered successfully! 🎉" },
      { status: 201 }, // 201 Created: The statutory HTTP response code for successful entity creation
    );

  } catch (error) {
    // ==========================================
    // 💥 ERROR HANDLING BOUNDARY
    // ==========================================
    // WHY: Prevents system level or internal database crashes from revealing architectural configurations to the public browser.
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }, // 500 Internal Server Error: Indicates an unhandled exception occurred on the host system
    );
  }
}
