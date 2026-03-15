import { Link, useLocation } from "wouter";
import { BrainCircuit, Swords, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getAvatar } from "@/lib/avatars";

export function Navbar() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const avatar = user ? getAvatar(user.avatarId) : null;

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/5 rounded-b-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <BrainCircuit className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              Path<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-baseline space-x-1">
            {[
              { href: "/", label: "Home" },
              { href: "/onboarding", label: "Find Path" },
              { href: "/chat", label: "AI Advisor" },
              { href: "/battle", label: "⚔ Battle" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === href || (href !== "/" && location.startsWith(href)) ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-yellow-400 text-sm font-bold">⭐ {user.points}</span>
                  </div>
                  <Link href="/dashboard">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatar?.bg} flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform border-2 border-white/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]`} title="Dashboard">
                      {avatar?.emoji}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="rounded-full border-white/20 text-gray-300 hover:bg-white/5 gap-1.5">
                      <LogIn className="w-3.5 h-3.5" /> Login
                    </Button>
                  </Link>
                  <Link href="/onboarding">
                    <Button size="sm" className="rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      Start Journey
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
