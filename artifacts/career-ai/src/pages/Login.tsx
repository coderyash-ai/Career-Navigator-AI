import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Bot, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    setEmail("demo@pathAI.com");
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
        <div className="glass rounded-3xl p-8 border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your PathAI account</p>
          </div>

          <div className="mb-6 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-sm">
            <p className="text-cyan-300 font-medium flex items-center gap-2"><Sparkles className="w-4 h-4" /> Test Credentials</p>
            <div className="mt-1 space-y-0.5 text-gray-400 font-mono text-xs">
              <p>Email: <span className="text-white">demo@pathAI.com</span></p>
              <p>Password: <span className="text-white">demo123</span></p>
            </div>
            <button onClick={fillDemo} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline">Click to auto-fill</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary/50" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? "text" : "password"} placeholder="••••••••" required className="pl-10 pr-10 bg-white/5 border-white/10 focus-visible:ring-primary/50" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-3 text-muted-foreground hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full rounded-xl h-12 shadow-[0_0_20px_rgba(168,85,247,0.4)] font-semibold">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">Sign up free</Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-white transition-colors">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
