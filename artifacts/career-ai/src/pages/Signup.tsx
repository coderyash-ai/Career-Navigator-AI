import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Bot, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AVATARS } from "@/lib/avatars";

export default function Signup() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(username, email, password, selectedAvatar);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg z-10">
        <div className="glass rounded-3xl p-8 border border-white/10">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Start your AI career journey today</p>
          </div>

          {/* Avatar picker */}
          <div className="mb-6">
            <p className="text-sm text-gray-300 font-medium mb-3">Choose your avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(av => (
                <button key={av.id} type="button" onClick={() => setSelectedAvatar(av.id)}
                  className={`relative rounded-xl p-0.5 transition-all duration-150 ${selectedAvatar === av.id ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl`}>
                    {av.emoji}
                  </div>
                  {selectedAvatar === av.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-[8px]">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="cooluser" required className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" required className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary/50" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium">Password <span className="text-muted-foreground font-normal">(min 6 chars)</span></label>
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
              {isLoading ? "Creating account..." : "Create Account — Start Free"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-white transition-colors">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
