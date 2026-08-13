import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // 1. Import session helpers
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust path as necessary
import connectDB from "@/lib/mongoose";
import Score from "@/models/Score";
import User from "@/models/User";

// ========================================================
// 🚀 INBOUND HTTP POST SCORE RETENTION HANDLER
// ========================================================
// WHY: This serverless endpoint secures game metric submissions. Instead of relying 
// on client-provided user IDs (which could be easily spoofed using tools like Postman), 
// we intercept the incoming request on the server layer, verify the identity via encrypted 
// cookies, and execute atomic MongoDB update pipelines.
export async function POST(req: Request) {
  try {
    // Step 1: Open Mongoose Connection Pool
    await connectDB();

    // 2. Fetch the secure session from cookies
    // WHY: We read the session directly from server cookies to establish a rock-solid,
    // tamper-proof boundary for matching the inbound match statistics to the correct user account.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // 401 Unauthorized: Halt execution for anonymous traffic
    }

    const verifiedUserId = session.user.id;

    // 3. Read body data (we can drop userId from the expected incoming payload safely!)
    // WHY: Destructures incoming runtime game properties. We cast scores and counts to numbers 
    // to prevent any accidental string concatenation bugs from corrupting statistical calculations.
    const { categoryId, difficulty, score, totalQuestions } = await req.json();
    const pointsScored = Number(score);
    const questionsCount = Number(totalQuestions);

    // 4. Use verifiedUserId instead of req body parameters
    // WHY: We record an isolated historical tracking row for this specific match. This is what
    // populates timeline graphs and historic performance grids over time.
    await Score.create({
      userId: verifiedUserId,
      categoryId,
      difficulty,
      score: pointsScored,
      totalQuestions: questionsCount,
    });

    // ==========================================
    // 📊 ATOMIC USER DATA AGGREGATION UPDATE
    // ==========================================
    // WHY: Instead of doing an expensive read-then-write process, we update user aggregations in place.
    // We use the '$inc' operator to dynamically modify key counts across categories and difficulties simultaneously.
    // We use computed template literal strings to find nested data targets without overriding other stats.
    await User.findOneAndUpdate(
      { _id: verifiedUserId },
      {
        $inc: {
          gamesPlayed: 1, // Increment cumulative game sessions count by exactly one unit
          [`statsByDifficulty.${difficulty}.correct`]: pointsScored,
          [`statsByDifficulty.${difficulty}.total`]: questionsCount,
          [`statsByCategory.${categoryId}.correct`]: pointsScored,
          [`statsByCategory.${categoryId}.total`]: questionsCount,
        },
        // WHY: The '$max' operator checks the historical baseline high score. 
        // If the new score is higher, MongoDB updates it. If it is lower, MongoDB ignores it.
        $max: {
          highScore: pointsScored,
        },
      }
    );

    // Inform the frontend of a fully recorded database pipeline execution
    return NextResponse.json(
      { message: "Match tracking updated securely!" },
      { status: 200 }, // 200 OK: Complete request fulfillment signaling successful transaction updates
    );

  } catch (error: any) {
    // ========================================================
    // 💥 SYSTEM EXCEPTION SAFEGUARD LIMITS
    // ========================================================
    console.error("Failed to save score:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
