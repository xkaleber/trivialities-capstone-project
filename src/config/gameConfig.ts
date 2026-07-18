export const CATEGORIES = [
  { id: "9", name: "General Knowledge", themeKey: "general" },
  { id: "21", name: "Sports", themeKey: "sports" },
  { id: "11", name: "Movies & Film", themeKey: "movies" },
  { id: "17", name: "Science & Nature", themeKey: "science" },
  { id: "23", name: "History", themeKey: "history" },
];

export const THEMES: Record<
  string,
  {
    textGradient: string;
    borderColor: string;
    focusRing: string;
    badge: string;
    primaryBtn: string;
    difficultyActive: string;
  }
> = {
  general: {
    textGradient: "from-cyan-400 to-blue-500",
    borderColor: "border-slate-700",
    focusRing: "focus:ring-cyan-500",
    badge: "bg-slate-700 text-cyan-300",
    primaryBtn:
      "from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400",
    difficultyActive:
      "bg-cyan-500 border-cyan-400 text-slate-900 shadow-cyan-500/20",
  },
  sports: {
    textGradient: "from-amber-400 to-orange-500",
    borderColor: "border-orange-900/50",
    focusRing: "focus:ring-orange-500",
    badge: "bg-orange-950 text-amber-300 border border-orange-800",
    primaryBtn:
      "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:ring-orange-400",
    difficultyActive:
      "bg-amber-500 border-amber-400 text-slate-900 shadow-amber-500/20",
  },
  movies: {
    textGradient: "from-purple-400 to-pink-500",
    borderColor: "border-purple-900/50",
    focusRing: "focus:ring-pink-500",
    badge: "bg-purple-950 text-pink-300 border border-purple-800",
    primaryBtn:
      "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus:ring-pink-400",
    difficultyActive:
      "bg-purple-500 border-purple-400 text-slate-900 shadow-purple-500/20",
  },
  science: {
    textGradient: "from-emerald-400 to-teal-500",
    borderColor: "border-emerald-900/50",
    focusRing: "focus:ring-emerald-500",
    badge: "bg-emerald-950 text-teal-300 border border-emerald-800",
    primaryBtn:
      "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-400",
    difficultyActive:
      "bg-emerald-500 border-emerald-400 text-slate-900 shadow-emerald-500/20",
  },
  history: {
    textGradient: "from-yellow-500 to-amber-700",
    borderColor: "border-amber-900/50",
    focusRing: "focus:ring-yellow-600",
    badge: "bg-amber-950 text-yellow-300 border border-amber-800",
    primaryBtn:
      "from-yellow-600 to-amber-700 hover:from-yellow-700 hover:to-amber-800 focus:ring-yellow-500",
    difficultyActive:
      "bg-yellow-600 border-yellow-500 text-slate-900 shadow-yellow-600/20",
  },
};
