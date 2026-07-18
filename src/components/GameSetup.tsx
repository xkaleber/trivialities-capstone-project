"use client";
import { CATEGORIES, THEMES } from "@/config/gameConfig";

interface GameSetupProps {
  difficulty: string;
  setDifficulty: (diff: string) => void;
  // Type shape matching individual category array entries
  selectedCategory: { id: string; name: string; themeKey: string };
  setSelectedCategory: (cat: any) => void;
  onStartGame: () => void;
  loading: boolean;
}

export default function GameSetup({
  difficulty,
  setDifficulty,
  selectedCategory,
  setSelectedCategory,
  onStartGame,
  loading,
}: GameSetupProps) {
  // Pull dynamic aesthetic tokens based on whichever category is currently hovered or chosen
  const currentTheme = THEMES[selectedCategory.themeKey] || THEMES.general;

  return (
    <div
      className={`w-full max-w-2xl bg-slate-800/80 border ${currentTheme.borderColor} p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 backdrop-blur-md transition-colors duration-500`}
    >
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1
          className={`text-4xl font-black bg-gradient-to-r ${currentTheme.textGradient} bg-clip-text text-transparent tracking-tight transition-all duration-500`}
        >
          Trivialities
        </h1>
        <p className="text-slate-400 text-xs tracking-wide">
          Select a subject category and difficulty level to test your knowledge.
        </p>
      </div>

      {/* Grid List of Colorful Theme Buttons */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
          Choose Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            const catTheme = THEMES[cat.themeKey] || THEMES.general;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`p-4 text-sm font-bold text-left rounded-2xl border transition-all duration-300 transform active:scale-[0.98] cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? `bg-slate-900 border-cyan-500 shadow-lg ${catTheme.focusRing}`
                    : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white"
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && (
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${catTheme.badge}`}
                  >
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Config Row using Theme Tokens */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
          Select Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["easy", "medium", "hard"].map((diff) => {
            const isSelected = difficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl border transition-all duration-300 capitalize cursor-pointer ${
                  isSelected
                    ? currentTheme.difficultyActive
                    : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600 text-slate-400 hover:text-slate-200"
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Boot Trigger Button using Theme Tokens */}
      <button
        onClick={onStartGame}
        disabled={loading}
        className={`w-full py-4 bg-gradient-to-r ${currentTheme.primaryBtn} text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl disabled:opacity-50 active:scale-[0.99] cursor-pointer mt-2`}
      >
        {loading ? "Assembling Question Stream..." : "Start Quiz →"}
      </button>
    </div>
  );
}
