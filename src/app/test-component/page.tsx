"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import { ICleanedQuestion } from "@/models/Question";

// Separate the layout wrapper to conform cleanly with Next.js parameter suspense rules
function TestComponentContent() {
  const [selected, setSelected] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const scenario = searchParams.get("scenario");

  const mockTheme = {
    borderColor: "border-slate-700",
    textGradient: "from-cyan-400 to-blue-500",
    focusRing: "ring-cyan-500",
    badge: "bg-slate-700 text-white",
  };

  let mockQuestion: ICleanedQuestion = {
    id: "mock-1",
    questionText: 'Which planet is known as the &quot;Red Planet&quot;?',
    options: ["Mars", "Venus", "Earth", "Jupiter"],
    correctAnswer: "Mars",
    category: "Science",
    difficulty: "easy",
  };

  let currentIdx = 0;

  if (scenario === "stress-test") {
    mockQuestion.questionText = "Rock &amp; Roll rules &#039;90s trivia &lt; Pop!";
    mockQuestion.options = ["True &amp; Right", "False &#039;n Wrong"];
  }

  if (scenario === "final-question") {
    currentIdx = 9;
  }

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

export default function TestComponentPage() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen flex items-center justify-center">
      {/* ✨ Suspense wrapper eliminates the Next.js rendering error overlay */}
      <Suspense fallback={<div className="text-white">Loading Test Sandbox...</div>}>
        <TestComponentContent />
      </Suspense>
    </div>
  );
}
