"use client";
import { signIn, signOut } from "next-auth/react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

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
      {session ? (
        <div className="bg-slate-850/80 backdrop-blur-md py-2 px-3 rounded-2xl inline-flex items-center gap-4 border border-slate-700/50 shadow-xl">
          {/* Player Welcome Pill */}
          <div className="flex items-center gap-2 pl-1 pr-2">
            <span className="text-xs text-slate-400">
              Welcome,{" "}
              <span className="text-emerald-400 font-black">
                {session.user?.name || "Player"}
              </span>
            </span>
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${userTier.style}`}
            >
              {userTier.title}
            </span>
          </div>

          {/* Dashboard Capsule Button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 shadow-md shadow-cyan-500/5 active:scale-[0.96] cursor-pointer"
          >
            📊 Dashboard
          </button>

          {/* Log Out Capsule Button */}
          <button
            onClick={() => signOut()}
            className="px-3.5 py-1.5 bg-slate-900/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-800 hover:border-rose-500/40 transition-all duration-300 active:scale-[0.96] cursor-pointer"
          >
            🚪 Log Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn()}
          className="text-xs font-black uppercase tracking-widest text-amber-400 hover:text-slate-950 bg-amber-500/10 hover:bg-amber-500 py-2.5 px-4 rounded-xl border border-amber-500/30 transition-all duration-300 shadow-lg shadow-amber-500/5 animate-pulse hover:animate-none cursor-pointer"
        >
          ⚠️ Sign in to save match stats
        </button>
      )}
    </div>
  );
}
