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

export default function GamePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<ICleanedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const [userTier, setUserTier] = useState({
    title: "Trivia Novice",
    style: "border-slate-500/30 text-slate-400 bg-slate-500/10",
  });
  const [difficulty, setDifficulty] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  // Extract the live active theme styling tokens dynamically based on category
  const currentTheme = THEMES[selectedCategory.themeKey] || THEMES.general;

  // Fetch user tier status on session change
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

  // Function to save the final score to the backend and check for tier updates
  const saveFinalScore = async (finalScore: number) => {
    const activeUser = session as any;

    // Guard clause to ensure user is authenticated before proceeding
    if (!activeUser?.user?.id) return;

    // Attempt to save the score and check for tier updates
    try {
      const response = await fetch("/api/user/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUser.user.id,
          categoryId: selectedCategory.id,
          difficulty: difficulty,
          score: finalScore,
          totalQuestions: questions.length,
        }),
      });

      // If the response is not OK, throw an error to be caught in the catch block
      if (!response.ok) throw new Error("Failed to update dashboard metrics");

      const updateCheck = await axios.get("/api/user/dashboard-stats");
      const freshTier = updateCheck.data.personal?.stats?.tier;

      // If the tier has changed, update the state and show a toast notification
      if (freshTier && freshTier.title !== userTier.title) {
        setUserTier(freshTier);
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-bounce" : "animate-fadeOut"} max-w-md w-full bg-slate-800 border-2 border-amber-500 p-4 rounded-xl shadow-2xl flex flex-col items-center text-center gap-2`}
            >
              <span className="text-3xl">🏆</span>
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                Rank Up Unlocked!
              </h3>
              <span className="text-sm font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-md mt-1">
                {freshTier.title}
              </span>
            </div>
          ),
          { duration: 5000, position: "top-center" },
        ); // Top center layout toast anchor
      }
    } catch (err) {
      console.error("Analytics tracking failed:", err);
    }
  };

  // Function to initiate a new game session by fetching questions based on selected category and difficulty
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

  // Function to handle answer selection, update score, and manage game progression
  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentIdx].correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 10);
      toast.success("Correct Answer! +10 Pts", { position: "top-center" }); // Updated to top layout
    } else {
      toast.error(
        `Incorrect. Match Answer: ${questions[currentIdx].correctAnswer}`,
        { position: "top-center" },
      ); // Updated to top layout
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
      {/* Dynamic Global Toaster Setup anchored to the Top Center */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* MODULAR NAVIGATION NAVBAR OVERLAY */}
      <Navbar session={session} router={router} userTier={userTier} />

      {/* CORE DISPLAY ROUTING LOGIC BLOCK CONTAINER */}
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
            currentTheme={currentTheme} // Passes live theme configuration maps downwards
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
