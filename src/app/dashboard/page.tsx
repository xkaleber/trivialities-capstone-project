"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

// 1. Define Strict Type Interfaces
interface ITier {
  title: string;
  style: string;
}

interface IStatBreakdown {
  correct: number;
  total: number;
}

interface IPersonalStats {
  totalGames: number;
  highScore: number;
  averageScore: number;
  tier: ITier;
  statsByCategory: Record<string, IStatBreakdown>;
  statsByDifficulty: {
    easy?: IStatBreakdown;
    medium?: IStatBreakdown;
    hard?: IStatBreakdown;
  };
}

interface ITriviaMatch {
  matchNum?: number;
  score: number;
  category: string;
  difficulty: string;
  date: string;
}

interface ILeaderboardRow {
  rank: number;
  playerName: string;
  score: number;
  category: string;
  difficulty: string;
}

interface IApiResponse {
  leaderboard: ILeaderboardRow[];
  personal: {
    stats: IPersonalStats;
    history: ITriviaMatch[];
  };
}
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Apply Generic Types to useState Hooks
  const [leaderboard, setLeaderboard] = useState<ILeaderboardRow[]>([]);
  const [personalStats, setPersonalStats] = useState<IPersonalStats>({
    totalGames: 0,
    highScore: 0,
    averageScore: 0,
    tier: { title: "Trivia Novice", style: "" },
    statsByCategory: {},
    statsByDifficulty: {},
  });
  const [history, setHistory] = useState<ITriviaMatch[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (status === "authenticated") {
      axios
        .get<IApiResponse>("/api/user/dashboard-stats") // Type the Axios response
        .then((res) => {
          setLeaderboard(res.data.leaderboard);
          setPersonalStats(res.data.personal.stats);
          setHistory(res.data.personal.history);
        })
        .catch((err) => console.error("Error pulling analytics records:", err))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <p className="text-xl font-medium tracking-wide animate-pulse">
          Assembling Dashboard Data...
        </p>
      </div>
    );
  }

  // 3. Strongly Typed Chart Computations
  const chartData: ITriviaMatch[] = history.slice(0, 7).reverse();
  const highestScoreInChart = Math.max(
    ...chartData.map((g: ITriviaMatch) => g.score),
    10,
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Block with Live Tier Badge */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Player Analytics
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${personalStats.tier?.style || "border-slate-500/30 text-slate-400 bg-slate-500/10"}`}
              >
                🏆 {personalStats.tier?.title || "Trivia Novice"}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Review your lifetime metric trends and global standings.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            ← Return to Game
          </button>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl text-center">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {" "}
              Matches Played{" "}
            </span>
            <span className="text-4xl font-black text-slate-100 block mt-2">
              {" "}
              {personalStats.totalGames}{" "}
            </span>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl text-center">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {" "}
              Personal High Score{" "}
            </span>
            <span className="text-4xl font-black text-cyan-400 block mt-2">
              {personalStats.highScore}{" "}
              <span className="text-xs font-medium text-slate-500">Pts</span>
            </span>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl text-center">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {" "}
              Average Match Score{" "}
            </span>
            <span className="text-4xl font-black text-emerald-400 block mt-2">
              {personalStats.averageScore}{" "}
              <span className="text-xs font-medium text-slate-500">Pts</span>
            </span>
          </div>
        </div>

        {/* 📊 PROGRESSION SCORE TREND GRAPH ROW */}
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/40 shadow-xl space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-cyan-400">
            {" "}
            📊 Recent Performance Score Trends{" "}
          </h2>
          <div className="h-48 flex items-end justify-around gap-2 pt-6 border-b border-slate-700 px-4 bg-slate-950/30 rounded-xl">
            {chartData.map((game: ITriviaMatch, index: number) => {
              const barHeightPercentage = Math.max(
                (game.score / highestScoreInChart) * 100,
                12,
              );
              return (
                <div
                  key={index}
                  className="flex flex-col items-center w-full max-w-[60px] group relative"
                >
                  {/* Tooltip Hover Bubble */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-800 border border-slate-600 px-2 py-1 rounded text-[10px] font-bold shadow-xl transition-all duration-200 z-10 whitespace-nowrap capitalize">
                    {game.category} ({game.difficulty})
                  </div>
                  {/* Dynamic Scaled Graph Bar */}
                  <div
                    style={{ height: `${barHeightPercentage}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:from-blue-500 group-hover:to-cyan-300 transition-all duration-500 flex items-end justify-center pb-2 shadow-lg"
                  >
                    <span className="text-[10px] font-black text-slate-950">
                      {" "}
                      {game.score}{" "}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-wider">
                    {" "}
                    M{index + 1}{" "}
                  </span>
                </div>
              );
            })}
            {chartData.length === 0 && (
              <p className="text-center text-slate-600 italic pb-20 w-full text-sm">
                {" "}
                Play trivia matches to populate trend chart graphs.{" "}
              </p>
            )}
          </div>
        </div>

        {/* Main Content Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Global Leaderboard */}
          <div className="lg:col-span-2 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold tracking-tight border-b border-slate-800 pb-3 text-amber-400 flex items-center gap-2">
              {" "}
              🏆 Global Leaderboard{" "}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-slate-500 font-bold border-b border-slate-800 text-xs uppercase tracking-wider">
                    <th className="pb-3 w-12 text-center">Rank</th>
                    <th className="pb-3">Player</th>
                    <th className="pb-3">Subject</th>
                    <th className="pb-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {leaderboard.map((player: ILeaderboardRow) => (
                    <tr
                      key={player.rank}
                      className={`hover:bg-slate-800/40 transition-colors ${player.playerName?.toLowerCase() === session?.user?.name?.toLowerCase() ? "bg-cyan-950/20" : ""}`}
                    >
                      <td className="py-3.5 text-center font-black text-slate-400">
                        {" "}
                        #{player.rank}{" "}
                      </td>
                      <td className="py-3.5 font-bold text-slate-200">
                        {" "}
                        {player.playerName}{" "}
                      </td>
                      <td className="py-3.5 text-slate-400 capitalize">
                        {player.category}
                        <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700/40 ml-1">
                          {" "}
                          {player.difficulty}{" "}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-black text-cyan-400">
                        {" "}
                        {player.score}{" "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personal Score History Log Column */}
          <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold tracking-tight border-b border-slate-800 pb-3 text-slate-200">
              {" "}
              📊 Recent Matches{" "}
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {history.map((game: ITriviaMatch, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all"
                >
                  <div>
                    <span className="block font-bold text-slate-200 capitalize text-sm">
                      {" "}
                      {game.category || "Trivia"}{" "}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5 font-medium">
                      {" "}
                      {game.date} •{" "}
                      <span className="capitalize">{game.difficulty}</span>{" "}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-emerald-400 text-base">
                      {" "}
                      +{game.score}{" "}
                    </span>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      {" "}
                      Points{" "}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default function DashboardPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   const [leaderboard, setLeaderboard] = useState([]);
//   const [personalStats, setPersonalStats] = useState({
//     totalGames: 0,
//     highScore: 0,
//     averageScore: 0,
//     tier: { title: "Trivia Novice", style: "" },
//     statsByCategory: {}, // ✨ Safeguard
//     statsByDifficulty: {}, // ✨ Safeguard
//   });

//   const [history, setHistory] = useState<ITriviaMatch[]>([]);

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth");
//       return;
//     }

//     if (status === "authenticated") {
//       axios
//         .get("/api/user/dashboard-stats")
//         .then((res) => {
//           setLeaderboard(res.data.leaderboard);
//           setPersonalStats(res.data.personal.stats);
//           setHistory(res.data.personal.history);
//         })
//         .catch((err) => console.error("Error pulling analytics records:", err))
//         .finally(() => setLoading(false));
//     }
//   }, [status, router]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
//         <p className="text-xl font-medium tracking-wide animate-pulse">
//           Assembling Dashboard Data...
//         </p>
//       </div>
//     );
//   }

//   // 1. Grab your 7 newest matches, then flip chronologically (oldest on left, newest on right)
//   const chartData = history.slice(0, 7).reverse();

//   // 2. Find the highest score in this specific subset (fallback to 10 to avoid division by zero)
//   const highestScoreInChart = Math.max(...chartData.map((g) => g.score), 10);

//   return (
//     <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">
//       <div className="mx-auto max-w-6xl space-y-8">
//         {/* Header Block with Live Tier Badge */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
//           <div>
//             <div className="flex items-center gap-3 flex-wrap">
//               <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
//                 Player Analytics
//               </h1>
//               <span
//                 className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${personalStats.tier?.style || "border-slate-500/30 text-slate-400 bg-slate-500/10"}`}
//               >
//                 🏆 {personalStats.tier?.title || "Trivia Novice"}
//               </span>
//             </div>
//             <p className="text-slate-400 text-sm mt-1">
//               Review your lifetime metric trends and global standings.
//             </p>
//           </div>
//           <button
//             onClick={() => router.push("/")}
//             className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
//           >
//             ← Return to Game
//           </button>
//         </div>

//         {/* Metric Cards Row */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl text-center">
//             <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
//               Matches Played
//             </span>
//             <span className="text-4xl font-black text-slate-100 block mt-2">
//               {personalStats.totalGames}
//             </span>
//           </div>
//           <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl text-center">
//             <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
//               Personal High Score
//             </span>
//             <span className="text-4xl font-black text-cyan-400 block mt-2">
//               {personalStats.highScore}{" "}
//               <span className="text-xs font-medium text-slate-500">Pts</span>
//             </span>
//           </div>
//           <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl text-center">
//             <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
//               Average Match Score
//             </span>
//             <span className="text-4xl font-black text-emerald-400 block mt-2">
//               {personalStats.averageScore}{" "}
//               <span className="text-xs font-medium text-slate-500">Pts</span>
//             </span>
//           </div>
//         </div>

//         {/* 📊 PROGRESSION SCORE TREND GRAPH ROW */}
//         <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/40 shadow-xl space-y-4">
//           <h2 className="text-xl font-bold tracking-tight text-cyan-400">
//             📊 Recent Performance Score Trends
//           </h2>
//           <div className="h-48 flex items-end justify-around gap-2 pt-6 border-b border-slate-700 px-4 bg-slate-950/30 rounded-xl">
//             {chartData.map((game: any, index) => {
//               // 3. Scale the bar smoothly relative to the best game in this view
//               const barHeightPercentage = Math.max(
//                 (game.score / highestScoreInChart) * 100,
//                 12,
//               );

//               return (
//                 <div
//                   key={index}
//                   className="flex flex-col items-center w-full max-w-[60px] group relative"
//                 >
//                   {/* Tooltip Hover Bubble */}
//                   <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-800 border border-slate-600 px-2 py-1 rounded text-[10px] font-bold shadow-xl transition-all duration-200 z-10 whitespace-nowrap capitalize">
//                     {game.category} ({game.difficulty})
//                   </div>

//                   {/* Dynamic Scaled Graph Bar */}
//                   <div
//                     style={{ height: `${barHeightPercentage}%` }}
//                     className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:from-blue-500 group-hover:to-cyan-300 transition-all duration-500 flex items-end justify-center pb-2 shadow-lg"
//                   >
//                     <span className="text-[10px] font-black text-slate-950">
//                       {game.score}
//                     </span>
//                   </div>
//                   <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-wider">
//                     M{index + 1}
//                   </span>
//                 </div>
//               );
//             })}

//             {chartData.length === 0 && (
//               <p className="text-center text-slate-600 italic pb-20 w-full text-sm">
//                 Play trivia matches to populate trend chart graphs.
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Main Content Layout Split */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Global Leaderboard */}
//           <div className="lg:col-span-2 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 shadow-2xl space-y-4">
//             <h2 className="text-xl font-bold tracking-tight border-b border-slate-800 pb-3 text-amber-400 flex items-center gap-2">
//               🏆 Global Leaderboard
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse text-sm">
//                 <thead>
//                   <tr className="text-slate-500 font-bold border-b border-slate-800 text-xs uppercase tracking-wider">
//                     <th className="pb-3 w-12 text-center">Rank</th>
//                     <th className="pb-3">Player</th>
//                     <th className="pb-3">Subject</th>
//                     <th className="pb-3 text-right">Score</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-800/40">
//                   {leaderboard.map((player: any) => (
//                     <tr
//                       key={player.rank}
//                       className={`hover:bg-slate-800/40 transition-colors ${
//                         player.playerName?.toLowerCase() ===
//                         session?.user?.name?.toLowerCase()
//                           ? "bg-cyan-950/20"
//                           : ""
//                       }`}
//                     >
//                       <td className="py-3.5 text-center font-black text-slate-400">
//                         #{player.rank}
//                       </td>
//                       <td className="py-3.5 font-bold text-slate-200">
//                         {player.playerName}
//                       </td>
//                       <td className="py-3.5 text-slate-400 capitalize">
//                         {player.category}{" "}
//                         <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700/40 ml-1">
//                           {player.difficulty}
//                         </span>
//                       </td>
//                       <td className="py-3.5 text-right font-black text-cyan-400">
//                         {player.score}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Personal Score History Log Column */}
//           <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 shadow-2xl space-y-4">
//             <h2 className="text-xl font-bold tracking-tight border-b border-slate-800 pb-3 text-slate-200">
//               📊 Recent Matches
//             </h2>
//             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
//               {history.map((game: any, idx) => (
//                 <div
//                   key={idx}
//                   className="flex justify-between items-center bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all"
//                 >
//                   <div>
//                     <span className="block font-bold text-slate-200 capitalize text-sm">
//                       {game.category || "Trivia"}
//                     </span>
//                     <span className="block text-[10px] text-slate-500 mt-0.5 font-medium">
//                       {game.date} •{" "}
//                       <span className="capitalize">{game.difficulty}</span>
//                     </span>
//                   </div>
//                   <div className="text-right">
//                     <span className="block font-black text-emerald-400 text-base">
//                       +{game.score}
//                     </span>
//                     <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">
//                       Points
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
