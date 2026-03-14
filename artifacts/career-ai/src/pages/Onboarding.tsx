import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Code, Palette, LineChart, Briefcase, GraduationCap, ChevronRight, Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGetCareerRecommendations } from "@workspace/api-client-react";
import { Sparkles } from "lucide-react";

const INTEREST_CATEGORIES = [
  { id: "ai", label: "AI & Machine Learning", icon: Brain },
  { id: "dev", label: "Software Development", icon: Code },
  { id: "design", label: "UI/UX Design", icon: Palette },
  { id: "data", label: "Data Science", icon: LineChart },
  { id: "business", label: "Business & Management", icon: Briefcase },
  { id: "research", label: "Research & Academics", icon: GraduationCap },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState("");

  const { mutate: getRecommendations, isPending } = useGetCareerRecommendations();

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const payload = {
      skills,
      interests,
      education,
      experience,
      goals
    };
    
    getRecommendations({ data: payload }, {
      onSuccess: (data) => {
        // In a real app, we'd store this in global state/context
        // For now, we pass it via sessionStorage to keep it simple across route changes
        sessionStorage.setItem('careerRecommendations', JSON.stringify(data.recommendations));
        sessionStorage.setItem('userSkills', JSON.stringify(skills));
        setLocation("/recommendations");
      },
      onError: (err) => {
        console.error("Failed to get recommendations", err);
        // Fallback for missing backend during mockup phase
        const dummyData = [
          {
            careerTitle: "AI Prompt Engineer",
            matchPercentage: 95,
            explanation: "Your interest in AI and strong communication skills make this a perfect fit.",
            missingSkills: ["Python Basics", "LangChain"],
            salary: "$120k - $160k",
            jobOutlook: "Excellent"
          }
        ];
        sessionStorage.setItem('careerRecommendations', JSON.stringify(dummyData));
        sessionStorage.setItem('userSkills', JSON.stringify(skills));
        setLocation("/recommendations");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium mb-2 text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-1" />
          </div>

          <Card className="glass-panel border-white/10 shadow-2xl">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle>What are your current skills?</CardTitle>
                    <CardDescription>Type a skill and press enter to add it.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input 
                      placeholder="e.g. JavaScript, Public Speaking, Figma..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="text-lg py-6"
                    />
                    <div className="flex flex-wrap gap-2 pt-4">
                      {skills.map(skill => (
                        <Badge key={skill} variant="default" className="text-sm py-1.5 px-3 rounded-full cursor-pointer hover:bg-destructive hover:text-white hover:border-destructive transition-colors group" onClick={() => removeSkill(skill)}>
                          {skill}
                          <span className="ml-2 opacity-50 group-hover:opacity-100">×</span>
                        </Badge>
                      ))}
                      {skills.length === 0 && (
                        <span className="text-sm text-muted-foreground italic">No skills added yet.</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t border-white/5 pt-6">
                    <Button onClick={() => setStep(2)} disabled={skills.length === 0} className="rounded-full">
                      Next Step <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle>What are you interested in?</CardTitle>
                    <CardDescription>Select the fields that excite you the most.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {INTEREST_CATEGORIES.map(category => {
                        const isSelected = interests.includes(category.id);
                        return (
                          <div 
                            key={category.id}
                            onClick={() => toggleInterest(category.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                              isSelected 
                                ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-black/50 text-gray-400'}`}>
                              <category.icon className="w-5 h-5" />
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {category.label}
                            </span>
                            {isSelected && <Check className="w-5 h-5 text-primary ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-white/5 pt-6">
                    <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                    <Button onClick={() => setStep(3)} disabled={interests.length === 0} className="rounded-full">
                      Next Step <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle>Background & Experience</CardTitle>
                    <CardDescription>Tell us a bit about your journey so far.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Highest Education Level</label>
                      <Input 
                        placeholder="e.g. Bachelor's in Computer Science, Self-Taught..."
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Years of Experience</label>
                      <Input 
                        placeholder="e.g. 2 years in retail, just starting out..."
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-white/5 pt-6">
                    <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full">Back</Button>
                    <Button onClick={() => setStep(4)} disabled={!education || !experience} className="rounded-full">
                      Next Step <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle>What's your dream?</CardTitle>
                    <CardDescription>Describe your ideal career or what you want to achieve.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="I want to build products that help people, maybe start my own company one day. I prefer working remotely and value work-life balance..."
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      className="min-h-[150px] text-base"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-white/5 pt-6">
                    <Button variant="ghost" onClick={() => setStep(3)} className="rounded-full">Back</Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={!goals || isPending}
                      className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                    >
                      {isPending ? "Analyzing Profile..." : "Discover My Paths"} 
                      {!isPending && <Sparkles className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardFooter>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </main>
    </div>
  );
}
