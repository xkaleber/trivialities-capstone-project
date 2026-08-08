import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import Score from "@/models/Score";
import User from "@/models/User";
import mongoose from "mongoose";

// 🏷️ Category ID to Human-Readable Name Dictionary Map
const CATEGORY_MAP: Record<string, string> = {
  "9": "General Knowledge", "10": "Entertainment: Books", "11": "Entertainment: Film",
  "12": "Entertainment: Music", "13": "Musical Theater", "14": "Entertainment: Television",
  "15": "Entertainment: Video Games", "16": "Entertainment: Board Games", "17": "Science & Nature",
  "18": "Science: Computers", "19": "Science: Mathematics", "20": "Mythology", "21": "Sports",
  "22": "Geography", "23": "History", "24": "Politics", "25": "Art", "26": "Celebrities",
  "27": "Animals", "28": "Vehicles", "29": "Entertainment: Comics", "30": "Science: Gadgets",
  "31": "Anime & Manga", "32": "Cartoons & Animations",
};

function calculateUserTier(gamesCount: number, topScore: number) {
  if (gamesCount >= 20 || topScore >= 180) {
    return {
      title: "Trivia Grandmaster",
      style: "border-amber-500/40 text-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse",
    };
  } else if (gamesCount >= 10 || topScore >= 120) {
    return {
      title: "Mastermind",
      style: "border-purple-500/40 text-purple-400 bg-purple-500/10",
    };
  } else if (gamesCount >= 5 || topScore >= 70) {
    return {
      title: "Scholar",
      style: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
    };
  }
  return {
    title: "Trivia Novice",
    style: "border-slate-500/30 text-slate-400 bg-slate-500/10",
  };
}

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    // 1. FETCH GLOBAL LEADERBOARD (Top 10 highest records)
    const globalLeaderboard = await Score.find()
      .populate("userId", "username email name")
      .sort({ score: -1 })
      .limit(10)
      .lean();

    const formattedLeaderboard = globalLeaderboard.map((item: any, index) => {
      const detectedName = item.userId?.username || item.userId?.name || (item.userId?.email ? item.userId.email.split("@")[0] : null);
      return {
        rank: index + 1,
        playerName: detectedName || "Active Player",
        score: item.score,
        category: CATEGORY_MAP[item.categoryId] || item.categoryId || "General Knowledge",
        difficulty: item.difficulty || "medium",
      };
    });

    // 2. INITIALIZE PERSONAL STATS
    let personalHistory: any[] = [];
    let stats = {
      totalGames: 0,
      highScore: 0,
      averageScore: 0,
      tier: calculateUserTier(0, 0),
      // ✨ Adding breakdown items for your frontend charts/UI
      statsByCategory: {},
      statsByDifficulty: {}
    };

    if (session?.user?.id) {
      const plainStringId = session.user.id.toString();
      
      // Fetch the explicit aggregated data straight from the User Profile
      const userProfile = await User.findById(plainStringId).lean();

      let queryConditions: any[] = [{ userId: plainStringId }];
      if (mongoose.Types.ObjectId.isValid(plainStringId)) {
        queryConditions.push({ userId: new mongoose.Types.ObjectId(plainStringId) });
      }

      // Fetch scores ONLY for history timeline records now (limiting to last 20 for efficiency)
      const userScores = await Score.find({ $or: queryConditions })
        .sort({ createdAt: 1 })
        .limit(20) 
        .lean();

      if (userProfile) {
        // Compute average score based on total questions answered from history logs
        let calculatedAverage = 0;
        if (userScores.length > 0) {
          const totalPoints = userScores.reduce((sum: number, item: any) => sum + item.score, 0);
          calculatedAverage = Math.round(totalPoints / userScores.length);
        }

        stats = {
          totalGames: userProfile.gamesPlayed || 0,
          highScore: userProfile.highScore || 0,
          averageScore: calculatedAverage,
          tier: calculateUserTier(userProfile.gamesPlayed || 0, userProfile.highScore || 0),
          // Expose raw dynamic stats map data to frontend if needed
          statsByCategory: userProfile.statsByCategory || {},
          statsByDifficulty: userProfile.statsByDifficulty || {},
        };
      }

      if (userScores.length > 0) {
        personalHistory = userScores.map((item: any, idx: number) => ({
          matchNum: idx + 1,
          score: item.score,
          category: CATEGORY_MAP[item.categoryId] || item.categoryId || "General Knowledge",
          difficulty: item.difficulty,
          date: new Date(item.createdAt).toLocaleDateString(),
        }));
      }
    }

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      personal: {
        stats,
        history: personalHistory.reverse(),
      },
    });
  } catch (error) {
    console.error("Dashboard calculation pipeline broken:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
