import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import Score from "@/models/Score";
import User from "@/models/User";
import mongoose from "mongoose";

// ========================================================
// 🏷️ CATEGORY ID TO HUMAN-READABLE NAME DICTIONARY MAP
// ========================================================
// WHY: The OpenTriviaDB API returns raw numeric IDs for categories.
// We maintain this static dictionary to transform those raw numbers into clean,
// user-friendly text names before sending data downstream to client views.
const CATEGORY_MAP: Record<string, string> = {
  "9": "General Knowledge",
  "10": "Entertainment: Books",
  "11": "Entertainment: Film",
  "12": "Entertainment: Music",
  "13": "Musical Theater",
  "14": "Entertainment: Television",
  "15": "Entertainment: Video Games",
  "16": "Entertainment: Board Games",
  "17": "Science & Nature",
  "18": "Science: Computers",
  "19": "Science: Mathematics",
  "20": "Mythology",
  "21": "Sports",
  "22": "Geography",
  "23": "History",
  "24": "Politics",
  "25": "Art",
  "26": "Celebrities",
  "27": "Animals",
  "28": "Vehicles",
  "29": "Entertainment: Comics",
  "30": "Science: Gadgets",
  "31": "Anime & Manga",
  "32": "Cartoons & Animations",
};

// ========================================================
// 🏆 DYNAMIC COMPETITIVE RANK TIER CALCULATOR
// ========================================================
// WHY: We extract this logic into a pure function to determine a player's rank title 
// and custom Tailwind CSS layout styles based on game counts and high scores.
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

// ========================================================
// 🚀 INBOUND HTTP GET DASHBOARD HANDLER
// ========================================================
// WHY: This serverless endpoint builds the entire data structure needed to populate
// the profile dashboard, combining global top records with localized player data.
export async function GET() {
  try {
    // Step 1: Open Mongoose Connection Pool
    await connectDB();
    
    // Step 2: Extract active user authentication credentials from server storage
    const session = await getServerSession(authOptions);

    // ========================================================
    // 🌐 PIPELINE PHASE 1: GLOBAL LEADERBOARD CONSTRUCTION
    // ========================================================
    // WHY: We pull the top 10 highest distinct game entries from the collection.
    // .populate() injects matching user fields, and .lean() optimizes lookup speeds
    // by turning heavy Mongoose documents into lightweight JSON structures.
    const globalLeaderboard = await Score.find()
      .populate("userId", "username email name")
      .sort({ score: -1 })
      .limit(10)
      .lean();

    // Map out and sanitize field representations for the global rankings view
    const formattedLeaderboard = globalLeaderboard.map((item: any, index) => {
      // Fallback strategy: Extract alternative naming keys if a username is absent
      const detectedName = item.userId?.username || item.userId?.name || (item.userId?.email ? item.userId.email.split("@")[0] : null);
      return {
        rank: index + 1,
        playerName: detectedName || "Active Player",
        score: item.score,
        category: CATEGORY_MAP[item.categoryId] || item.categoryId || "General Knowledge",
        difficulty: item.difficulty || "medium",
      };
    });

    // ========================================================
    // 👤 PIPELINE PHASE 2: LOCAL PERSONAL ANALYTICS
    // ========================================================
    // Establish structural defaults for fresh or unauthenticated users to prevent page layout breaks
    let personalHistory: any[] = [];
    let stats = {
      totalGames: 0,
      highScore: 0,
      averageScore: 0,
      tier: calculateUserTier(0, 0), // Default initialized configuration state
      statsByCategory: {},
      statsByDifficulty: {}
    };

    // If a valid session user is detected, we load their contextual dashboard insights
    if (session?.user?.id) {
      const plainStringId = session.user.id.toString();

      // Fetch consolidated user statistics directly from the pre-aggregated User Document
      const userProfile = await User.findById(plainStringId).lean();

      // WHY: Depending on how older registration data was structured, a user ID might be stored
      // as a raw text string or as an explicit MongoDB ObjectId. We create an $or array containing
      // both possible formats to bulletproof our matching procedures.
      let queryConditions: any[] = [{ userId: plainStringId }];
      if (mongoose.Types.ObjectId.isValid(plainStringId)) {
        queryConditions.push({ userId: new mongoose.Types.ObjectId(plainStringId) });
      }

      // Fetch the last 20 scores only to construct a timeline match chart efficiently
      const userScores = await Score.find({ $or: queryConditions })
        .sort({ createdAt: 1 })
        .limit(20)
        .lean();

      if (userProfile) {
        // Calculate the dynamic average across logged records
        let calculatedAverage = 0;
        if (userScores.length > 0) {
          const totalPoints = userScores.reduce((sum: number, item: any) => sum + item.score, 0);
          calculatedAverage = Math.round(totalPoints / userScores.length);
        }

        // Overwrite the metrics container using computed fields and real-time tier rankings
        stats = {
          totalGames: userProfile.gamesPlayed || 0,
          highScore: userProfile.highScore || 0,
          averageScore: calculatedAverage,
          tier: calculateUserTier(userProfile.gamesPlayed || 0, userProfile.highScore || 0),
          statsByCategory: userProfile.statsByCategory || {},
          statsByDifficulty: userProfile.statsByDifficulty || {},
        };
      }

      // Format individual timeline items for historic game charts
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

    // ========================================================
    // 🎁 PIPELINE PHASE 3: UNIFIED TRANSMISSION DELIVERABLE
    // ========================================================
    // WHY: We call .reverse() on history items so dashboard timeline grids arrange from newest to oldest.
    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      personal: {
        stats,
        history: personalHistory.reverse(),
      },
    });

  } catch (error) {
    // ========================================================
    // 💥 SYSTEM EXCEPTION SAFEGUARD LIMITS
    // ========================================================
    console.error("Dashboard calculation pipeline broken:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
