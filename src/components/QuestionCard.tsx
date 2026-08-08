"use client";
import { ICleanedQuestion } from "@/models/Question";

// 1. Declare explicit shape structures matching theme token property arrays
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
  currentTheme: IGameTheme; // ✨ Replaced loose inline type mapping with strict interface
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  currentIdx,
  totalQuestions,
  currentTheme,
}: QuestionCardProps) {
  if (!question) return null;
  
  const options = question.options || [];

  return (
    <div className={`w-full max-w-2xl bg-slate-800/80 border ${currentTheme.borderColor} p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 backdrop-blur-md transition-all duration-500`} >
      {/* Top Meta Headers Tracker Bar */}
      <div className="flex justify-between items-center text-xs font-bold tracking-wider text-slate-500 uppercase border-b border-slate-700 pb-4">
        <span>Question Tracker</span>
        <span className={`px-2.5 py-1 rounded-md font-black ${currentTheme.badge}`} >
          {currentIdx + 1} / {totalQuestions}
        </span>
      </div>

      {/* Dynamic Themed Question Header String */}
      <h3 
        className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed text-center min-h-[60px] flex items-center justify-center" 
        dangerouslySetInnerHTML={{ __html: question.questionText }} 
      />

      {/* 2-Column Grid Layout for Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {options.map((option: string) => {
          const isSelected = selectedAnswer === option;
          return (
            <button 
              key={option} 
              onClick={() => onAnswerSelect(option)} 
              disabled={!!selectedAnswer} 
              className={`w-full p-4 rounded-xl text-left text-sm font-semibold transition-all border group cursor-pointer active:scale-[0.99] min-h-[56px] flex items-center justify-between ${ isSelected ? `bg-slate-900 border-cyan-500 text-cyan-400 font-bold shadow-lg ${currentTheme.focusRing}` : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white" }`} 
            >
              <span dangerouslySetInnerHTML={{ __html: option }} />
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
