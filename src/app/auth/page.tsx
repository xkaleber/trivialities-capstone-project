"use client"; // Tells Next.js that this component runs entirely on the browser (Client Component)

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [isLogin, setIsLogin] = useState(true);     // Toggles between the Sign In and Create Account view states
  const [loading, setLoading] = useState(false);     // Controls button disable status while processing server communication
  const [formData, setFormData] = useState({        // Aggregates text input variables into a single data container
    username: "",
    email: "",
    password: "",
  });

  // INPUT HANDLER TRANSITION
  // WHY: We use a dynamic bracket notation string reference `[e.target.name]` to map text updates
  // to corresponding property keys, avoiding duplicate onChange functions for every single field.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FORM SUBMISSION PIPELINE
  // WHY: Intercepts browser reload behaviors to route authentication payloads asynchronously.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ==========================================
        // 🔑 PIPELINE PHASE 1: LOGIN HANDLER
        // ==========================================
        // WHY: We pass login parameters to the NextAuth handler engine. 
        // We set `redirect: false` to retain JavaScript memory context, letting us handle errors 
        // cleanly and fire smooth toast animations rather than triggering ugly full-page reloads.
        const res = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (res?.error) {
          throw new Error("Invalid email address or password combination.");
        }

        toast.success("Welcome back! 🎉");
        router.push("/");
        
        // WHY: We execute router.refresh() to force Next.js to reconstruct Server Components 
        // in the current layout hierarchy. This ensures the navbar instantly detects the updated login token.
        router.refresh();

      } else {
        // ==========================================
        // 📝 PIPELINE PHASE 2: SIGNUP HANDLER
        // ==========================================
        // WHY: We dispatch registration packages to the custom signup API route backend.
        const response = await axios.post("/api/auth/signup", formData);
        
        toast.success(
          response.data.message || "Account created successfully! Please sign in.",
        );

        // Reset state variables and toggle menu context back to the log-in view layer
        setFormData({ username: "", email: "", password: "" });
        setIsLogin(true);
      }
    } catch (error: any) {
      // WHY: We build a safe fallback path to catch custom database error messages or standard network exceptions.
      const errorMsg = error.response?.data?.error || error.message || "An unexpected error occurred.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-white">
      {/* Toast Notification Container Overlay Anchor */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        
        {/* HEADER SECTION AREA */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Trivialities
          </h1>
          <p className="mt-2 text-slate-400">
            {isLogin ? "Sign in to track high scores" : "Create an account to start playing"}
          </p>
        </div>

        {/* SECURE SUBMISSION ENTRY WRAPPER */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* USERNAME PLACEMENT FIELD: Conditionally injected only during registration sequences */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Username
              </label>
              <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="TriviaMaster99" />
            </div>
          )}

          {/* EMAIL ENTRY PLACEMENT FIELD */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="you@example.com" />
          </div>

          {/* PASSWORD ENTRY PLACEMENT FIELD */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="••••••••" />
          </div>

          {/* DYNAMIC FORM SUBMIT BUTTON CONTROLLER */}
          <button type="submit" disabled={loading} className="w-full font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-white hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition cursor-pointer" >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* BOTTOM TAB TOGGLE SECTION AREA */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-cyan-400 hover:underline cursor-pointer" >
            {isLogin ? "Sign up here" : "Log in here"}
          </button>
        </div>

      </div>
    </div>
  );
}
