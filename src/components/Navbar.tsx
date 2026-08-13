"use client"; // Tells Next.js that this component runs entirely on the browser (Client Component)

import { signIn, signOut } from "next-auth/react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// ==========================================
// 🛡️ TYPE SPECIFICATIONS AND INTERFACES
// ==========================================
// WHY: We establish precise structural shape parameters passed down from the parent shell.
// This allows the navbar to display localized session data, trigger routing hooks, and render
// active competitive player tier levels in a component framework.
interface IExtendedSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
  };
}

interface ITier {
  title: string;
  style: string;
}

interface NavbarProps {
  session: IExtendedSession | null;
  router: AppRouterInstance;
  userTier: ITier;
}

export default function Navbar({ session, router, userTier }: NavbarProps) {
  return (
    <div className="mb-6 text-right w-full max-w-2xl animate-fadeIn">
      {/* ==========================================
          👥 CONDITIONAL BRANCH A: AUTHENTICATED STATE
          ==========================================
          WHY: If NextAuth confirms an active player token inside cookies, we render 
          the unified profile controller capsule showing personalized metrics and tools. */}
      {session ? (
        <div className="bg-slate-850/80 backdrop-blur-md py-2 px-3 rounded-2xl inline-flex items-center gap-4 border border-slate-700/50 shadow-xl">
          
          {/* PLAYER WELCOME PILL */}
          {/* WHY: We display the user's username or email fallback while dynamically mapping 
              the corresponding competitive styling classes fetched directly from database profiles. */}
          <div className="flex items-center gap-2 pl-1 pr-2">
            <span className="text-xs text-slate-400">
              Welcome,{" "}
              <span className="text-emerald-400 font-black">
                {session.user?.name || "Player"}
              </span>
            </span>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${userTier.style}`} >
              {userTier.title}
            </span>
          </div>

          {/* DASHBOARD CAPSULE BUTTON */}
          {/* WHY: We intercept clicks to push the user to the profile analytics view grid 
              without triggering an expensive full-browser page refresh pipeline. */}
          <button onClick={() => router.push("/dashboard")} className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 shadow-md shadow-cyan-500/5 active:scale-[0.96] cursor-pointer" >
            📊 Dashboard
          </button>

          {/* LOG OUT CAPSULE BUTTON */}
          {/* WHY: We connect this directly to NextAuth's signOut routine, which safely 
              flushes server tokens and destroys local session client contexts. */}
          <button onClick={() => signOut()} className="px-3.5 py-1.5 bg-slate-900/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-800 hover:border-rose-500/40 transition-all duration-300 active:scale-[0.96] cursor-pointer" >
            🚪 Log Out
          </button>

        </div>
      ) : (
        // ==========================================
        // 🔒 CONDITIONAL BRANCH B: ANONYMOUS STATE
        // ==========================================
        // WHY: If session parameters return null, we render a clear call-to-action warning badge.
        // We use an animate-pulse system to capture player focus, reminding guests that match points 
        // will not be permanently stored unless an account registration layer is finalized.
        <button onClick={() => signIn()} className="text-xs font-black uppercase tracking-widest text-amber-400 hover:text-slate-950 bg-amber-500/10 hover:bg-amber-500 py-2.5 px-4 rounded-xl border border-amber-500/30 transition-all duration-300 shadow-lg shadow-amber-500/5 animate-pulse hover:animate-none cursor-pointer" >
          ⚠️ Sign in to save match stats
        </button>
      )}
    </div>
  );
}
