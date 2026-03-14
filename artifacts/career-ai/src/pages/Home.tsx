import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MessageSquare, Compass, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiriOrb } from "@/components/3d/SiriOrb";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/space-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <SiriOrb />
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border-primary/30 text-primary-foreground text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Powered by Gemini AI Next-Gen Models</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black font-display leading-tight mb-6 text-white">
            Unlock Your True <br/>
            <span className="text-gradient text-glow">Career Potential</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Navigate the future of work with personalized, AI-generated roadmaps. Discover careers matching your unique DNA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding">
              <Button size="lg" className="w-full sm:w-auto rounded-full group text-lg h-14 px-8 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]">
                Generate My Path
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="glass" className="w-full sm:w-auto rounded-full text-lg h-14 px-8">
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat with AI Advisor
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 w-full max-w-5xl"
        >
          {[
            { icon: Compass, label: "Paths Mapped", value: "500K+" },
            { icon: Target, label: "Accuracy", value: "98%" },
            { icon: BookOpen, label: "Resources", value: "10M+" },
            { icon: Sparkles, label: "AI Models", value: "Gemini Pro" }
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center hover-elevate">
              <stat.icon className="w-8 h-8 text-secondary mb-3 opacity-80" />
              <h3 className="text-3xl font-bold font-display text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
