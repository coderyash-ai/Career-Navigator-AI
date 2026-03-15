import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Target, TrendingUp, DollarSign, AlertCircle, ArrowRight, Bot } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Fallback type matching api.schemas.ts
interface CareerMatch {
  careerTitle: string;
  matchPercentage: number;
  explanation: string;
  missingSkills: string[];
  salary: string;
  jobOutlook: string;
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<CareerMatch[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('careerRecommendations');
    if (stored) {
      try {
        setRecommendations(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recommendations");
      }
    }
  }, []);

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">No recommendations found</h2>
          <p className="text-muted-foreground mb-6">Complete your profile to get AI career matches.</p>
          <Link href="/onboarding">
            <Button>Go to Onboarding</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4">
              Your Career <span className="text-gradient">Matches</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Based on your unique profile, our AI has identified these optimal career paths. Select one to generate a step-by-step roadmap.
            </p>
          </div>
          <Link href="/chat?discuss=matches">
            <Button variant="glass" className="rounded-full whitespace-nowrap border-primary/50">
              <Bot className="w-5 h-5 mr-2 text-primary" />
              Discuss Matches with AI
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.careerTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-2xl mb-2">{rec.careerTitle}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="glass" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-secondary" />
                        {rec.jobOutlook} Outlook
                      </Badge>
                      <Badge variant="glass" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        {rec.salary}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Circular Progress Match */}
                  <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeDasharray={`${rec.matchPercentage}, 100`}
                        className="drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold text-white">{rec.matchPercentage}%</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col pt-4">
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                    {rec.explanation}
                  </p>
                  
                  {rec.missingSkills && rec.missingSkills.length > 0 && (
                    <div className="mb-6 bg-black/40 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-white">
                        <AlertCircle className="w-4 h-4 text-accent" />
                        Skills to Acquire
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.missingSkills.map(skill => (
                          <Badge key={skill} variant="outline" className="border-accent/30 text-gray-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Link href={`/roadmap?career=${encodeURIComponent(rec.careerTitle)}`}>
                    <Button className="w-full rounded-xl group mt-auto">
                      Generate Roadmap
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
