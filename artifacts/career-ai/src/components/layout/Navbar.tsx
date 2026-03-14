import { Link, useLocation } from "wouter";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/5 rounded-b-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <BrainCircuit className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                Path<span className="text-primary">AI</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>Home</Link>
              <Link href="/onboarding" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.startsWith('/onboarding') ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>Find Path</Link>
              <Link href="/chat" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.startsWith('/chat') ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>AI Advisor</Link>
            </div>
          </div>
          
          <div>
            <Link href="/onboarding">
              <Button className="rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                Start Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
