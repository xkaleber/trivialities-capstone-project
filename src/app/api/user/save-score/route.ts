import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Score from "@/models/Score";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, categoryId, difficulty, score, totalQuestions } =
      await req.json();

    // Directly create the record using Score model
    await Score.create({
      userId,
      categoryId,
      difficulty,
      score,
      totalQuestions,
    });

    return NextResponse.json(
      { message: "Match tracking updated successfully!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Failed to save score:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
