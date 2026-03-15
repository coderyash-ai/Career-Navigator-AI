import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Youtube, Code, PlayCircle, CheckCircle, Circle, FlaskConical, ExternalLink, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetCareerRoadmap, useGetYoutubeSuggestions } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

const RESEARCH_SITES = [
  { name: "arXiv", desc: "Free pre-prints in CS, Math, Physics", icon: "📄", color: "from-red-500/20 to-orange-500/20 border-red-500/30", url: (q: string) => `https://arxiv.org/search/?query=${encodeURIComponent(q)}&searchtype=all` },
  { name: "Google Scholar", desc: "Search scholarly literature", icon: "🎓", color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30", url: (q: string) => `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}` },
  { name: "Semantic Scholar", desc: "AI-powered research discovery", icon: "🧠", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30", url: (q: string) => `https://www.semanticscholar.org/search?q=${encodeURIComponent(q)}&sort=Relevance` },
  { name: "ResearchGate", desc: "Collaborate with researchers", icon: "🔬", color: "from-green-500/20 to-teal-500/20 border-green-500/30", url: (q: string) => `https://www.researchgate.net/search?q=${encodeURIComponent(q)}` },
  { name: "IEEE Xplore", desc: "IEEE technical papers & standards", icon: "⚡", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30", url: (q: string) => `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(q)}` },
  { name: "Papers With Code", desc: "ML papers + implementations", icon: "💻", color: "from-purple-500/20 to-violet-500/20 border-purple-500/30", url: (q: string) => `https://paperswithcode.com/search?q_meta=&q_type=&q=${encodeURIComponent(q)}` },
];

export default function Roadmap() {
  const searchParams = new URLSearchParams(window.location.search);
  const careerTitle = searchParams.get("career") || "Unknown Career";
  const { user, token } = useAuth();

  const { mutate: getRoadmap, data: roadmapData, isPending: roadmapLoading } = useGetCareerRoadmap();
  const { mutate: getVideos, data: videoData, isPending: videoLoading } = useGetYoutubeSuggestions();

  const [mockRoadmap, setMockRoadmap] = useState<any>(null);
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [researchLinks, setResearchLinks] = useState<any[]>([]);
  const [researchLoading, setResearchLoading] = useState(false);

  useEffect(() => {
    const userSkills = JSON.parse(sessionStorage.getItem("userSkills") || "[]");
    getRoadmap({ data: { careerTitle, currentSkills: userSkills, timeframe: "6 months" } }, {
      onError: () => {
        setMockRoadmap({
          careerTitle, totalDuration: "6 Months",
          milestones: [
            { monthRange: "Month 1-2", focusArea: "Foundations & Fundamentals", specificTopics: ["Basic Syntax", "Core Concepts", "Environment Setup"], projectIdea: "Build a simple personal portfolio or CLI tool.", resources: ["FreeCodeCamp Basics", "Official Documentation"] },
            { monthRange: "Month 3-4", focusArea: "Advanced Frameworks", specificTopics: ["State Management", "API Integration", "Routing"], projectIdea: "Create a fully functional weather app consuming public APIs.", resources: ["Advanced Video Courses", "GitHub Repositories"] },
            { monthRange: "Month 5-6", focusArea: "Production & Portfolio", specificTopics: ["Deployment", "Testing", "Optimization"], projectIdea: "Deploy a full-stack application with user authentication.", resources: ["Vercel/Netlify Guides", "System Design Primer"] },
          ],
        });
      },
    });
    getVideos({ data: { careerTitle, topics: ["Beginner Tutorial", "Day in the life", "Interview Prep"] } });

    // Fetch research links
    setResearchLoading(true);
    fetch(`/api/career/research-links?careerTitle=${encodeURIComponent(careerTitle)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setResearchLinks(data); })
      .catch(() => {})
      .finally(() => setResearchLoading(false));
  }, [careerTitle]);

  useEffect(() => {
    if (!user || !token) return;
    fetch(`/api/progress/roadmap/${encodeURIComponent(careerTitle)}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: { milestoneIndex: number; completed: boolean }[]) => {
        const map: Record<number, boolean> = {};
        data.forEach(p => { map[p.milestoneIndex] = p.completed; });
        setProgress(map);
      })
      .catch(() => {});
  }, [user, token, careerTitle]);

  const toggleMilestone = async (index: number) => {
    if (!user || !token) return;
    const newVal = !progress[index];
    setProgress((prev: Record<number, boolean>) => ({ ...prev, [index]: newVal }));
    setSavingIndex(index);
    try {
      await fetch(`/api/progress/roadmap/${encodeURIComponent(careerTitle)}/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: newVal }),
      });
    } catch {}
    setSavingIndex(null);
  };

  const activeRoadmap = roadmapData || mockRoadmap;
  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalMilestones = activeRoadmap?.milestones?.length ?? 0;
  const progressPct = totalMilestones ? Math.round((completedCount / totalMilestones) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background z-0 fixed" />
      <Navbar />

      <main className="relative z-10 pt-32 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge variant="glass" className="mb-4 border-secondary/50 text-secondary">{activeRoadmap?.totalDuration || "Loading"} Path</Badge>
          <h1 className="text-4xl md:text-6xl font-black font-display text-white mb-4">
            Roadmap to <span className="text-glow text-primary">{careerTitle}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Your personalized learning journey. Check off milestones as you complete them.</p>
        </div>

        {/* Progress Bar */}
        {user && totalMilestones > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 border border-white/10 mb-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-300">Your Progress</p>
                <p className="text-xs text-muted-foreground">{completedCount} of {totalMilestones} milestones completed</p>
              </div>
              <span className="text-3xl font-black font-display text-primary">{progressPct}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {progressPct === 100 && (
              <p className="text-center text-green-400 font-semibold mt-3 text-sm">🎉 Congratulations! You've completed this roadmap!</p>
            )}
          </motion.div>
        )}

        {roadmapLoading && !mockRoadmap ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Generating your custom AI roadmap...</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-background transform md:-translate-x-1/2 opacity-30" />
            <div className="space-y-12">
              {activeRoadmap?.milestones.map((milestone: any, index: number) => {
                const isDone = !!progress[index];
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                    className={`relative flex flex-col md:flex-row gap-8 items-start ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                  >
                    {/* Timeline Node */}
                    <div className={`absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-background border-4 transform -translate-x-1/2 mt-1 z-10 flex items-center justify-center transition-all ${isDone ? "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]" : "border-primary shadow-[0_0_15px_rgba(168,85,247,1)]"}`}>
                      <div className={`w-2 h-2 rounded-full ${isDone ? "bg-green-400" : "bg-white"}`} />
                    </div>
                    <div className="hidden md:block w-1/2" />

                    <Card className={`w-full md:w-1/2 ml-12 md:ml-0 glass-panel border-white/10 transition-all ${isDone ? "border-green-500/30 bg-green-500/5" : "hover:border-primary/50"}`}>
                      <CardContent className="p-6 md:p-8">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <Badge variant="default" className={`${isDone ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-primary/20 text-primary border-primary/30"}`}>
                            {milestone.monthRange}
                          </Badge>
                          {user && (
                            <button onClick={() => toggleMilestone(index)} disabled={savingIndex === index}
                              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${isDone ? "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400" : "bg-white/5 border-white/20 text-gray-400 hover:bg-primary/20 hover:border-primary/40 hover:text-primary"}`}
                            >
                              {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                              {savingIndex === index ? "Saving..." : isDone ? "Completed" : "Mark done"}
                            </button>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 font-display">{milestone.focusArea}</h3>
                        <div className="space-y-4 mb-6">
                          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Topics to Learn</h4>
                            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-200">
                              {milestone.specificTopics.map((topic: string, i: number) => <li key={i}>{topic}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2"><Code className="w-4 h-4" /> Project Idea</h4>
                          <p className="text-white text-sm leading-relaxed">{milestone.projectIdea}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Research Links Section */}
        <div className="mt-24 border-t border-white/10 pt-16">
          <div className="flex items-center gap-3 mb-3">
            <FlaskConical className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white font-display">Research & Deep Dive</h2>
          </div>
          <p className="text-muted-foreground mb-8">AI-curated research papers and technical resources to help you master <span className="text-cyan-400 font-medium">{careerTitle}</span>.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {researchLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />)
            ) : researchLinks.length > 0 ? (
              researchLinks.map((paper: any, i: number) => (
                <a key={i} href={paper.url} target="_blank" rel="noopener noreferrer" 
                  className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-cyan-500/30 text-cyan-400">{paper.category}</Badge>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{paper.title}</h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{paper.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                    <span>{paper.authors}</span>
                    <span>{paper.year}</span>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-full text-center py-10 glass rounded-2xl border border-white/5">
                <p className="text-muted-foreground">No specific papers found. Use the general research tools below.</p>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400" /> General Research Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESEARCH_SITES.map(site => (
              <a key={site.name} href={site.url(careerTitle)} target="_blank" rel="noopener noreferrer"
                className={`group p-5 rounded-2xl border bg-gradient-to-br ${site.color} hover:scale-[1.02] transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{site.icon}</span>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-white mb-1">{site.name}</h3>
                <p className="text-xs text-gray-400">{site.desc}</p>
                <div className="mt-3 text-xs text-gray-500 truncate font-mono">Search: "{careerTitle}"</div>
              </a>
            ))}
          </div>
        </div>

        {/* YouTube Section */}
        <div className="mt-16 border-t border-white/10 pt-16">
          <div className="flex items-center gap-3 mb-8">
            <Youtube className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-white font-display">Recommended Learning</h2>
          </div>
          {videoLoading && !videoData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(videoData?.videos || [
                { title: "Complete Guide to " + careerTitle, channel: "Tech Academy", category: "Tutorial", description: "Learn everything from scratch in this comprehensive course." },
                { title: "Day in the Life of a " + careerTitle, channel: "Tech Vlogs", category: "Vlog", description: "See what it's actually like working in this role." },
                { title: careerTitle + " Interview Prep", channel: "Career Hacker", category: "Career", description: "Top 50 questions you need to know." },
              ]).map((video: any, i: number) => (
                <Card key={i} className="bg-black/40 border-white/10 hover:bg-black/60 transition-colors group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <Badge variant="outline" className="w-fit mb-3 bg-red-500/10 text-red-400 border-red-500/20">{video.category}</Badge>
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{video.channel}</p>
                    <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3">{video.description}</p>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery || video.title)}`} target="_blank" rel="noreferrer">
                      <Button variant="secondary" className="w-full rounded-xl gap-2 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <PlayCircle className="w-4 h-4" /> Watch on YouTube
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
