import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // 1. Import session helpers
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust path as necessary
import connectDB from "@/lib/mongoose";
import Score from "@/models/Score";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // 2. Fetch the secure session from cookies
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const verifiedUserId = session.user.id;

    // 3. Read body data (we can drop userId from the expected incoming payload safely!)
    const { categoryId, difficulty, score, totalQuestions } = await req.json();

    const pointsScored = Number(score); 
    const questionsCount = Number(totalQuestions);

    // 4. Use verifiedUserId instead of req body parameters
    await Score.create({
      userId: verifiedUserId,
      categoryId,
      difficulty,
      score: pointsScored,
      totalQuestions: questionsCount,
    });

    await User.findOneAndUpdate(
      { _id: verifiedUserId },
      {
        $inc: {
          gamesPlayed: 1,
          [`statsByDifficulty.${difficulty}.correct`]: pointsScored,
          [`statsByDifficulty.${difficulty}.total`]: questionsCount,
          [`statsByCategory.${categoryId}.correct`]: pointsScored,
          [`statsByCategory.${categoryId}.total`]: questionsCount,
        },
        $max: {
          highScore: pointsScored,
        },
      }
    );

    return NextResponse.json(
      { message: "Match tracking updated securely!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Failed to save score:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
