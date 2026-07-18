"use client";

interface GameSummaryProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onViewDashboard: () => void;
}

export default function GameSummary({
  score,
  totalQuestions,
  onRestart,
  onViewDashboard,
}: GameSummaryProps) {
  // Compute percentage performance grading scale mapping parameters out of 100 points
  const scorePercent =
    totalQuestions > 0 ? Math.round((score / (totalQuestions * 10)) * 100) : 0;

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700/60 shadow-2xl max-w-xl w-full text-center space-y-8 animate-fadeIn">
      <div className="space-y-1">
        <span className="text-3xl">🏁</span>
        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent uppercase">
          Match Complete!
        </h2>
        <p className="text-slate-400 text-xs">
          Your answers have been processed and uploaded to the database metrics
          log.
        </p>
      </div>

      {/* Graphic Circle Score Badge Overlay Display ring */}
      <div className="relative flex items-center justify-center mx-auto w-36 h-36 rounded-full border-4 border-slate-900 bg-slate-900/40 shadow-inner group">
        <div className="absolute inset-2 rounded-full border border-dashed border-slate-700/60 group-hover:rotate-45 transition-transform duration-1000" />
        <div className="space-y-0.5 z-10">
          <span className="block text-4xl font-black text-cyan-400">
            {score}
          </span>
          <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {scorePercent}% Grade
          </span>
        </div>
      </div>

      {/* Dual Column Action Buttons Grid Row footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-750 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700/80 hover:border-slate-600 transition active:scale-[0.98] cursor-pointer"
        >
          🔄 Play Another Match
        </button>
        <button
          onClick={onViewDashboard}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition active:scale-[0.98] shadow-lg cursor-pointer"
        >
          📊 Review Dashboard Trends
        </button>
      </div>
    </div>
  );
}
