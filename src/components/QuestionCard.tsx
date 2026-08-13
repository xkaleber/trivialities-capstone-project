"use client"; // Tells Next.js that this component runs entirely on the browser (Client Component)

import { ICleanedQuestion } from "@/models/Question";

// ========================================================
// 🧹 NATIVE BROWSER HTML ENTITY DECODER
// ========================================================
// WHY: The OpenTriviaDB API transmits data with raw encoded HTML entities (like &quot; or &#039;). 
// We build this helper to instantiate an isolated browser DOMParser context. This lets us cleanly 
// translate escape sequence nodes back into plain readable symbols without installing heavy third-party parsing packages.
const decodeHTMLEntities = (text: string): string => {
  if (typeof window === "undefined") return text; // SSR Boundary protection: returns unparsed strings if executed server-side
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return doc.documentElement.textContent || "";
};

// ========================================================
// 🛡️ TYPE SPECIFICATIONS AND INTERFACES
// ========================================================
// 1. Declare explicit shape structures matching theme token property arrays
// WHY: We enforce strict shapes for dynamic category configuration maps. 
// This keeps variable bindings tightly documented and blocks runtime type leak failures.
interface IGameTheme {
  borderColor: string;
  textGradient: string;
  focusRing: string;
  badge: string;
  difficultyActive?: string;
  primaryBtn?: string;
}

// 2. Apply theme type configuration cleanly onto props
interface QuestionCardProps {
  question: ICleanedQuestion;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  currentIdx: number;
  totalQuestions: number;
  currentTheme: IGameTheme;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  currentIdx,
  totalQuestions,
  currentTheme,
}: QuestionCardProps) {
  
  // Guard clause boundary check to prevent property mapping errors if question states flush
  if (!question) return null;
  const options = question.options || [];

  return (
    <div className={`w-full max-w-2xl bg-slate-800/80 border ${currentTheme.borderColor} p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 backdrop-blur-md transition-all duration-500`} >
      
      {/* TOP META HEADERS TRACKER BAR */}
      <div className="flex justify-between items-center text-xs font-bold tracking-wider text-slate-500 uppercase border-b border-slate-700 pb-4">
        <span>Question Tracker</span>
        <span className={`px-2.5 py-1 rounded-md font-black ${currentTheme.badge}`}>
          {currentIdx + 1} / {totalQuestions}
        </span>
      </div>

      {/* DYNAMIC THEMED QUESTION HEADER STRING */}
      {/* WHY: We feed the raw string through the secure extraction handler instead of utilizing 
          dangerouslySetInnerHTML, eliminating Cross-Site Scripting (XSS) code injection risks. */}
      <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed text-center min-h-[60px] flex items-center justify-center">
        {decodeHTMLEntities(question.questionText)} {/* ✨ Safe native decoding */}
      </h3>

      {/* 2-COLUMN GRID LAYOUT FOR ANSWER OPTIONS */}
      {/* WHY: We loop over the question parameters array to populate choices layout slots. 
          By setting `disabled={!!selectedAnswer}`, we lock user interaction nodes the moment a 
          selection is recorded, protecting the app from multi-click score vulnerabilities. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {options.map((option: string) => {
          const isSelected = selectedAnswer === option;
          return (
            <button key={option} onClick={() => onAnswerSelect(option)} disabled={!!selectedAnswer} className={`w-full p-4 rounded-xl text-left text-sm font-semibold transition-all border group cursor-pointer active:scale-[0.99] min-h-[56px] flex items-center justify-between ${ isSelected ? `bg-slate-900 border-cyan-500 text-cyan-400 font-bold shadow-lg ${currentTheme.focusRing}` : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white" }`} >
              <span>{decodeHTMLEntities(option)}</span> {/* ✨ Safe native decoding */}
              {isSelected && (
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${currentTheme.badge}`} >
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
