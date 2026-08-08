"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ICleanedQuestion } from "@/models/Question";
import { CATEGORIES, THEMES } from "@/config/gameConfig";

// 📦 IMPORT CUSTOM SUBCOMPONENTS
import GameSetup from "../components/GameSetup";
import QuestionCard from "../components/QuestionCard";
import GameSummary from "../components/GameSummary";
import Navbar from "../components/Navbar";

// 1. Extend NextAuth Session types locally to support custom id strings
interface IExtendedSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null; // ✨ Explicitly registers the user id
  };
}

interface ITier {
  title: string;
  style: string;
}

export default function GamePage() {
  // 2. Cast useSession natively to use your IExtendedSession type fallback
  const { data: session } = useSession() as { data: IExtendedSession | null };
  const router = useRouter();
  const [questions, setQuestions] = useState<ICleanedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<ITier>({
    title: "Trivia Novice",
    style: "border-slate-500/30 text-slate-400 bg-slate-500/10",
  });
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const currentTheme = THEMES[selectedCategory.themeKey] || THEMES.general;

  useEffect(() => {
    if (session) {
      axios
        .get("/api/user/dashboard-stats")
        .then((res) => {
          if (res.data.personal?.stats?.tier) {
            setUserTier(res.data.personal.stats.tier);
          }
        })
        .catch((err) => console.error("Could not fetch tier status:", err));
    }
  }, [session]);

  const saveFinalScore = async (finalScore: number) => {
    // 3. Type-safe validation check
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/user/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ✨ Cleaned: We no longer need to pass userId in the body,
          // but we still pass category, difficulty, and score!
          categoryId: selectedCategory.id,
          difficulty: difficulty,
          score: finalScore,
          totalQuestions: questions.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to update dashboard metrics");

      const updateCheck = await axios.get("/api/user/dashboard-stats");
      const freshTier = updateCheck.data.personal?.stats?.tier as
        | ITier
        | undefined;

      if (freshTier && freshTier.title !== userTier.title) {
        setUserTier(freshTier);
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-bounce" : "animate-fadeOut"} max-w-md w-full bg-slate-800 border-2 border-amber-500 p-4 rounded-xl shadow-2xl flex flex-col items-center text-center gap-2`}
            >
              <span className="text-3xl">🏆</span>
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                {" "}
                Rank Up Unlocked!{" "}
              </h3>
              <span className="text-sm font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-md mt-1">
                {" "}
                {freshTier.title}{" "}
              </span>
            </div>
          ),
          { duration: 5000, position: "top-center" },
        );
      }
    } catch (err) {
      console.error("Analytics tracking failed:", err);
    }
  };

  const startNewGame = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/questions?category=${selectedCategory.id}&difficulty=${difficulty}`,
      );
      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
        setScore(0);
        setCurrentIdx(0);
        setSelectedAnswer(null);
        setGameActive(true);
        setShowSummary(false);
      } else {
        toast.error("Could not load fresh category pools. Try another theme.");
      }
    } catch (err) {
      toast.error("API boundary transmission failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentIdx].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 10);
      toast.success("Correct Answer! +10 Pts", { position: "top-center" });
    } else {
      toast.error(
        `Incorrect. Match Answer: ${questions[currentIdx].correctAnswer}`,
        { position: "top-center" },
      );
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setGameActive(false);
        setShowSummary(true);
        saveFinalScore(score + (isCorrect ? 10 : 0));
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 items-center justify-center p-4 text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar session={session} router={router} userTier={userTier} />

      <main className="w-full flex items-center justify-center">
        {showSummary && (
          <GameSummary
            score={score}
            totalQuestions={questions.length}
            onRestart={startNewGame}
            onViewDashboard={() => router.push("/dashboard")}
          />
        )}
        {gameActive && !showSummary && (
          <QuestionCard
            question={questions[currentIdx]}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelection}
            currentIdx={currentIdx}
            totalQuestions={questions.length}
            currentTheme={currentTheme}
          />
        )}
        {!gameActive && !showSummary && (
          <GameSetup
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onStartGame={startNewGame}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}
