import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Youtube, Code, Lightbulb, PlayCircle, Search, Map } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetCareerRoadmap, useGetYoutubeSuggestions } from "@workspace/api-client-react";

export default function Roadmap() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const careerTitle = searchParams.get('career') || "Unknown Career";
  
  const { mutate: getRoadmap, data: roadmapData, isPending: roadmapLoading } = useGetCareerRoadmap();
  const { mutate: getVideos, data: videoData, isPending: videoLoading } = useGetYoutubeSuggestions();

  // Mock data for development if backend isn't ready
  const [mockRoadmap, setMockRoadmap] = useState<any>(null);

  useEffect(() => {
    const userSkills = JSON.parse(sessionStorage.getItem('userSkills') || '[]');
    
    // Call API
    getRoadmap({
      data: {
        careerTitle,
        currentSkills: userSkills,
        timeframe: "6 months"
      }
    }, {
      onError: () => {
        // Fallback mockup data
        setMockRoadmap({
          careerTitle,
          totalDuration: "6 Months",
          milestones: [
            {
              monthRange: "Month 1-2",
              focusArea: "Foundations & Fundamentals",
              specificTopics: ["Basic Syntax", "Core Concepts", "Environment Setup"],
              projectIdea: "Build a simple personal portfolio or CLI tool.",
              resources: ["FreeCodeCamp Basics", "Official Documentation"]
            },
            {
              monthRange: "Month 3-4",
              focusArea: "Advanced Frameworks",
              specificTopics: ["State Management", "API Integration", "Routing"],
              projectIdea: "Create a fully functional weather app consuming public APIs.",
              resources: ["Advanced Video Courses", "GitHub Repositories"]
            },
            {
              monthRange: "Month 5-6",
              focusArea: "Production & Portfolio",
              specificTopics: ["Deployment", "Testing", "Optimization"],
              projectIdea: "Deploy a full-stack application with user authentication.",
              resources: ["Vercel/Netlify Guides", "System Design Primer"]
            }
          ]
        });
      }
    });

    getVideos({
      data: {
        careerTitle,
        topics: ["Beginner Tutorial", "Day in the life", "Interview Prep"]
      }
    });
  }, [careerTitle, getRoadmap, getVideos]);

  const activeRoadmap = roadmapData || mockRoadmap;

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background z-0 fixed" />
      <Navbar />

      <main className="relative z-10 pt-32 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <Badge variant="glass" className="mb-4 border-secondary/50 text-secondary">
            {activeRoadmap?.totalDuration || "Loading"} Path
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black font-display text-white mb-4">
            Roadmap to <span className="text-glow text-primary">{careerTitle}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personalized learning journey. Follow these milestones to achieve your career goal.
          </p>
        </div>

        {roadmapLoading && !mockRoadmap ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Generating your custom AI roadmap...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-background transform md:-translate-x-1/2 opacity-30" />

            <div className="space-y-12">
              {activeRoadmap?.milestones.map((milestone: any, index: number) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex flex-col md:flex-row gap-8 items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary transform -translate-x-1/2 mt-1 shadow-[0_0_15px_rgba(168,85,247,1)] z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block w-1/2" />

                  {/* Content Card */}
                  <Card className="w-full md:w-1/2 ml-12 md:ml-0 glass-panel border-white/10 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 md:p-8">
                      <Badge variant="default" className="mb-4 bg-primary/20 text-primary border-primary/30">
                        {milestone.monthRange}
                      </Badge>
                      <h3 className="text-2xl font-bold text-white mb-4 font-display">{milestone.focusArea}</h3>
                      
                      <div className="space-y-4 mb-6">
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                          <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> Topics to Learn
                          </h4>
                          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-200">
                            {milestone.specificTopics.map((topic: string, i: number) => (
                              <li key={i}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                          <Code className="w-4 h-4" /> Project Idea
                        </h4>
                        <p className="text-white text-sm leading-relaxed">{milestone.projectIdea}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Video Resources Section */}
        <div className="mt-32 border-t border-white/10 pt-16">
          <div className="flex items-center gap-3 mb-8">
            <Youtube className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-white font-display">Recommended Learning</h2>
          </div>

          {videoLoading && !videoData ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fallback mockup videos if API fails */}
              {(videoData?.videos || [
                { title: "Complete Guide to " + careerTitle, channel: "Tech Academy", category: "Tutorial", description: "Learn everything from scratch in this comprehensive course." },
                { title: "Day in the Life of a " + careerTitle, channel: "Tech Vlogs", category: "Vlog", description: "See what it's actually like working in this role." },
                { title: careerTitle + " Interview Prep", channel: "Career Hacker", category: "Career", description: "Top 50 questions you need to know." }
              ]).map((video: any, i: number) => (
                <Card key={i} className="bg-black/40 border-white/10 hover:bg-black/60 transition-colors group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <Badge variant="outline" className="w-fit mb-3 bg-red-500/10 text-red-400 border-red-500/20">
                      {video.category}
                    </Badge>
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{video.channel}</p>
                    <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3">{video.description}</p>
                    
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery || video.title)}`} target="_blank" rel="noreferrer">
                      <Button variant="secondary" className="w-full rounded-xl gap-2 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <PlayCircle className="w-4 h-4" />
                        Watch on YouTube
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
