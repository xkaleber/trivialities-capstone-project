"use client"; // Tells Next.js that this component runs entirely on the browser (Client Component)

import { CATEGORIES, THEMES } from "@/config/gameConfig";

// ========================================================
// 🛡️ TYPE SPECIFICATIONS AND INTERFACES
// ========================================================
// 1. Define strict type shape matching individual config entry parameters
// WHY: We enforce a dedicated interface for category items. This eliminates runtime 
// type leaks, blocks potential compilation bugs, and cleanly documents the required properties.
interface IGameCategory {
  id: string;
  name: string;
  themeKey: string;
}

// 2. Type your props cleanly using the category interface
// WHY: We establish a strict contract for parent-to-child data bindings. 
// Replacing loose definitions like 'any' ensures that state dispatcher parameters are 
// fully validated by the TypeScript compiler before compilation.
interface GameSetupProps {
  difficulty: string;
  setDifficulty: (diff: string) => void;
  selectedCategory: IGameCategory;
  setSelectedCategory: (cat: IGameCategory) => void; // ✨ Replaced 'any' with strict interface
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
  
  // WHY: We pull lookups from the static central style matrix mapping. 
  // If a category configuration key is completely unassigned, we apply standard baseline values.
  const currentTheme = THEMES[selectedCategory.themeKey] || THEMES.general;

  return (
    <div className={`w-full max-w-2xl bg-slate-800/80 border ${currentTheme.borderColor} p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 backdrop-blur-md transition-colors duration-500`} >
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-2">
        <h1 className={`text-4xl font-black bg-gradient-to-r ${currentTheme.textGradient} bg-clip-text text-transparent tracking-tight transition-all duration-500`} >
          Trivialities
        </h1>
        <p className="text-slate-400 text-xs tracking-wide">
          Select a subject category and difficulty level to test your knowledge.
        </p>
      </div>

      {/* GRID LIST OF COLORFUL THEME BUTTONS */}
      {/* WHY: We iterate over our internal game config category array to build dynamic selectors. 
          By pulling sub-themes during the mapping execution loop, each row automatically previews 
          its corresponding color tokens even before the user clicks to make a choice. */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
          Choose Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat: IGameCategory) => {
            const isSelected = selectedCategory.id === cat.id;
            const catTheme = THEMES[cat.themeKey] || THEMES.general;
            return (
              <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat)} className={`p-4 text-sm font-bold text-left rounded-2xl border transition-all duration-300 transform active:scale-[0.98] cursor-pointer flex items-center justify-between group ${ isSelected ? `bg-slate-900 border-cyan-500 shadow-lg ${catTheme.focusRing}` : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white" }`} >
                <span>{cat.name}</span>
                {isSelected && (
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${catTheme.badge}`} >
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DIFFICULTY CONFIG ROW USING THEME TOKENS */}
      {/* WHY: We hardcode a strict matching string loop over standard parameters. 
          When an item state equates to true, we dynamically inject the selected item's 
          active stylistic values to keep the aesthetic theme unified. */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
          Select Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["easy", "medium", "hard"].map((diff) => {
            const isSelected = difficulty === diff;
            return (
              <button key={diff} type="button" onClick={() => setDifficulty(diff)} className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl border transition-all duration-300 capitalize cursor-pointer ${ isSelected ? currentTheme.difficultyActive : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600 text-slate-400 hover:text-slate-200" }`} >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN GAME BOOT TRIGGER BUTTON USING THEME TOKENS */}
      {/* WHY: We hook this element directly into the loading state managed by the parent. 
          Disabling the element immediately during active transitions prevents duplicate 
          network fetch operations if an eager user clicks the submit action multiple times. */}
      <button onClick={onStartGame} disabled={loading} className={`w-full py-4 bg-gradient-to-r ${currentTheme.primaryBtn} text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl disabled:opacity-50 active:scale-[0.99] cursor-pointer mt-2`} >
        {loading ? "Assembling Question Stream..." : "Start Quiz →"}
      </button>

    </div>
  );
}
