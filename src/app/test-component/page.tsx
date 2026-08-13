"use client"; // Tells Next.js that this component runs entirely on the browser (Client Component)

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import { ICleanedQuestion } from "@/models/Question";

// Separate the layout wrapper to conform cleanly with Next.js parameter suspense rules
// WHY: Deconstructing the inner sandbox into a distinct component allows us to isolate 
// the `useSearchParams()` call. Next.js requires this separation so static page optimization 
// boundaries don't break during production builds.
function TestComponentContent() {
  const [selected, setSelected] = useState<string | null>(null); // Local mock state mimicking the parent game's answer selection tracker
  const searchParams = useSearchParams();                         // Reads incoming scenario flags straight from the test URL path
  const scenario = searchParams.get("scenario");

  // WHY: We assemble a mock configuration payload to substitute for the real category configurations, 
  // letting us see how the UI subcomponent renders styles and layout borders.
  const mockTheme = {
    borderColor: "border-slate-700",
    textGradient: "from-cyan-400 to-blue-500",
    focusRing: "ring-cyan-500",
    badge: "bg-slate-700 text-white",
  };

  // WHY: We hardcode a structured baseline item to pass down into the QuestionCard layout frames.
  // This features raw HTML entities like &quot; so we can verify if the component decodes characters properly.
  let mockQuestion: ICleanedQuestion = {
    id: "mock-1",
    questionText: 'Which planet is known as the &quot;Red Planet&quot;?',
    options: ["Mars", "Venus", "Earth", "Jupiter"],
    correctAnswer: "Mars",
    category: "Science",
    difficulty: "easy",
  };

  let currentIdx = 0; // Baseline counter tracking the progress index frame

  // ==========================================
  // 🔬 SANDBOX SCENARIO CONDITIONS
  // ==========================================
  // Scenario A: Stress Testing Text Parsing Boundaries
  // WHY: We inject heavy HTML escape characters (&amp;, &lt;, etc.) directly into properties. 
  // This lets us confirm whether the QuestionCard component safely displays clean plain text or leaks raw escape blocks.
  if (scenario === "stress-test") {
    mockQuestion.questionText = "Rock &amp; Roll rules '90s trivia &lt; Pop!";
    mockQuestion.options = ["True &amp; Right", "False 'n Wrong"];
  }

  // Scenario B: Progress Frame Simulation
  // WHY: Setting the tracker manually lets us check how the UI elements change layout states 
  // when approaching match termination sequences.
  if (scenario === "final-question") {
    currentIdx = 9;
  }

  // RENDER INTERACTION ELEMENT
  // Forward our mock datasets straight down into the child subcomponent to process isolated layout frames.
  return (
    <QuestionCard
      question={mockQuestion}
      selectedAnswer={selected}
      onAnswerSelect={setSelected}
      currentIdx={currentIdx}
      totalQuestions={10}
      currentTheme={mockTheme}
    />
  );
}

// ==========================================
// 📦 GLOBAL SANDBOX LAYOUT WRAPPER
// ==========================================
export default function TestComponentPage() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen flex items-center justify-center">
      {/* ✨ Suspense wrapper eliminates the Next.js rendering error overlay */}
      {/* WHY: Next.js App Router enforces a strict layout rule. Any component querying `useSearchParams()` 
          must be wrapped inside a `<Suspense>` container. If omitted, the build engine throws an error 
          overlay because the server cannot pre-render runtime URL states. */}
      <Suspense fallback={<div className="text-white">Loading Test Sandbox...</div>}>
        <TestComponentContent />
      </Suspense>
    </div>
  );
}
