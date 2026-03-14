import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/20 via-background to-background z-0" />
      
      <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md w-full text-center border-white/10">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-destructive/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-6xl font-black font-display text-white mb-2 text-glow">404</h1>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Lost in Space</h2>
        <p className="text-muted-foreground mb-8">
          The career path you're looking for doesn't exist in our known universe.
        </p>
        
        <Link href="/">
          <Button className="w-full rounded-xl h-12 text-lg">
            <Home className="w-5 h-5 mr-2" />
            Return to Base
          </Button>
        </Link>
      </div>
    </div>
  );
}
