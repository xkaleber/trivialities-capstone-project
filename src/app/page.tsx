"use client"; // Tells Next.js that this component runs entirely on the browser (Client Component)

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
// WHY: Default NextAuth configurations don't always expose user.id in TypeScript.
// We use this interface to explicitly register 'id' so TypeScript doesn't throw compilation errors.
interface IExtendedSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null; // ✨ Explicitly registers the user id
  };
}

// WHY: Defines the structure for the visual rank tier, matching the database return data.
interface ITier {
  title: string;
  style: string;
}

export default function GamePage() {
  // 2. Cast useSession natively to use the IExtendedSession type fallback
  // WHY: Forces NextAuth's hook to accept the custom session interface so we can access session.user.id safely.
  const { data: session } = useSession() as { data: IExtendedSession | null };
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [questions, setQuestions] = useState<ICleanedQuestion[]>([]); // Holds the array of trivia questions fetched from the API
  const [currentIdx, setCurrentIdx] = useState<number>(0);            // Tracks which question number the user is currently on
  const [score, setScore] = useState<number>(0);                      // Tracks the running total score (+10 per correct answer)
  const [loading, setLoading] = useState<boolean>(false);             // Controls loading spinners while waiting for API questions
  const [gameActive, setGameActive] = useState<boolean>(false);       // Flags if the user is actively answering questions right now
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // Tracks the answer string the user clicked on
  const [showSummary, setShowSummary] = useState<boolean>(false);     // Toggles visibility of the final score summary screen
  
  // Tracks the user's competitive rank with fallback styling for initialization
  const [userTier, setUserTier] = useState<ITier>({
    title: "Trivia Novice",
    style: "border-slate-500/30 text-slate-400 bg-slate-500/10",
  });
  
  const [difficulty, setDifficulty] = useState<string>("medium");     // Tracks chosen difficulty modifier (easy, medium, hard)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]); // Tracks the selected category object (defaults to first item)

  // WHY: Looks up the aesthetic visual colors/theme configuration mapped to the selected category key.
  const currentTheme = THEMES[selectedCategory.themeKey] || THEMES.general;

  // FETCH USER PROFILE ON INITIAL LOAD
  // WHY: Runs once when a logged-in user hits the page to pull the current rank status from the database.
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

  // SAVE GAME METRICS TO DATABASE
  // WHY: Fired when the last question is answered to log metrics to the DB and check for user ranking promotions.
  const saveFinalScore = async (finalScore: number) => {
    // 3. Type-safe validation check
    if (!session?.user?.id) return; // Halt execution if the user isn't fully authenticated

    try {
      // Step 1: Save the game records to the database
      const response = await fetch("/api/user/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          difficulty: difficulty,
          score: finalScore,
          totalQuestions: questions.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to update dashboard metrics");

      // Step 2: Query user stats immediately after saving to see if the new score caused a level-up/rank-up
      const updateCheck = await axios.get("/api/user/dashboard-stats");
      const freshTier = updateCheck.data.personal?.stats?.tier as | ITier | undefined;

      // Step 3: If a rank up happened, save the new rank state and fire a custom reactive pop-up toast
      if (freshTier && freshTier.title !== userTier.title) {
        setUserTier(freshTier);
        toast.custom(
          (t) => (
            <div className={`${t.visible ? "animate-bounce" : "animate-fadeOut"} max-w-md w-full bg-slate-800 border-2 border-amber-500 p-4 rounded-xl shadow-2xl flex flex-col items-center text-center gap-2`} >
              <span className="text-3xl">🏆</span>
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                {" "} Rank Up Unlocked!{" "}
              </h3>
              <span className="text-sm font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-md mt-1">
                {" "} {freshTier.title}{" "}
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

  // INITIALIZE A TRIVIA LOBBY
  // WHY: Fires when hitting "Start". Wipes state clean and requests fresh questions from the category pools endpoint.
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

  // EVALUATE SELECTED OPTIONS
  // WHY: Checks correctness, adds points, fires feedback toasts, and handles game progression timeouts.
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

    // 2-Second Deliberate Delay Window: Lets user look at feedback before routing next frames
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        // Option A: Advance to the next question index inside the current match
        setCurrentIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        // Option B: Game Over. Wrap up loops, clear visibility states, and calculate score payload
        setGameActive(false);
        setShowSummary(true);
        
        // WHY: Passing 'score + (isCorrect ? 10 : 0)' manually bypasses React state batching delays,
        // making sure the final database save receives the completely accurate score.
        saveFinalScore(score + (isCorrect ? 10 : 0));
      }
    }, 2000);
  };

  // CONDITIONAL VIEW LAYOUT RENDERING
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 items-center justify-center p-4 text-white">
      {/* Toast Notification Container Overlay Anchor */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Navbar session={session} router={router} userTier={userTier} />
      
      <main className="w-full flex items-center justify-center">
        {/* VIEW PHASE 3: GAME SUMMARY DISPLAY */}
        {showSummary && (
          <GameSummary score={score} totalQuestions={questions.length} onRestart={startNewGame} onViewDashboard={() => router.push("/dashboard")} />
        )}

        {/* VIEW PHASE 2: QUESTIONS INTERACTION CARD */}
        {gameActive && !showSummary && (
          <QuestionCard question={questions[currentIdx]} selectedAnswer={selectedAnswer} onAnswerSelect={handleAnswerSelection} currentIdx={currentIdx} totalQuestions={questions.length} currentTheme={currentTheme} />
        )}

        {/* VIEW PHASE 1: GAME CATEGORY SELECTION & DIFFICULTY SETUP */}
        {!gameActive && !showSummary && (
          <GameSetup difficulty={difficulty} setDifficulty={setDifficulty} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onStartGame={startNewGame} loading={loading} />
        )}
      </main>
    </div>
  );
}
