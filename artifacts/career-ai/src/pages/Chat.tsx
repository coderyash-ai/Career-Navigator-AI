import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Trash2, PlusCircle, MessageSquare, Youtube, ExternalLink, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStream, type YoutubeVideo } from "@/hooks/use-chat-stream";
import { useListGeminiConversations, useCreateGeminiConversation, useDeleteGeminiConversation, useGetGeminiConversation } from "@workspace/api-client-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Fundamentals": "border-blue-500/40 text-blue-400 bg-blue-500/10",
  "Advanced": "border-purple-500/40 text-purple-400 bg-purple-500/10",
  "Project-Based": "border-green-500/40 text-green-400 bg-green-500/10",
  "Interview Prep": "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  "Career Tips": "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
  "Tools & Frameworks": "border-orange-500/40 text-orange-400 bg-orange-500/10",
};

function YoutubeVideoCard({ video }: { video: YoutubeVideo }) {
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`;
  const categoryClass = CATEGORY_COLORS[video.category] ?? "border-white/20 text-gray-400 bg-white/5";
  return (
    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-xl border border-white/10 bg-black/30 hover:bg-red-900/20 hover:border-red-500/30 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600/40 transition-colors">
        <Play className="w-4 h-4 text-red-400 fill-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-100 group-hover:text-white leading-tight line-clamp-1">{video.title}</p>
          <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-red-400 flex-shrink-0 mt-0.5 transition-colors" />
        </div>
        <p className="text-xs text-gray-500 mt-0.5 mb-1.5">{video.channel}</p>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{video.description}</p>
        <span className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryClass}`}>{video.category}</span>
      </div>
    </a>
  );
}

function YoutubePanel({ videos, careerTopic }: { videos: YoutubeVideo[]; careerTopic?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="mt-3 rounded-2xl border border-red-500/20 bg-black/40 backdrop-blur-md overflow-hidden"
    >
      <button onClick={() => setIsOpen(v => !v)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors">
        <Youtube className="w-4 h-4 text-red-500" />
        <span className="text-sm font-semibold text-gray-200">Recommended Videos{careerTopic ? ` · ${careerTopic}` : ""}</span>
        <Badge variant="outline" className="ml-auto text-xs border-red-500/30 text-red-400 bg-red-500/10">{videos.length} videos</Badge>
        <span className="text-gray-500 text-xs ml-1">{isOpen ? "▲" : "▼"}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/5 pt-3">
              {videos.map((video, i) => <YoutubeVideoCard key={i} video={video} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Chat() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);

  const params = new URLSearchParams(window.location.search);
  const discussMode = params.get("discuss") === "matches";

  const { data: conversations, refetch: refetchConvs } = useListGeminiConversations();
  const { mutateAsync: createConv } = useCreateGeminiConversation();
  const { mutate: deleteConv } = useDeleteGeminiConversation();
  const { data: activeConvData, isFetching: isLoadingHistory } = useGetGeminiConversation(activeConvId || 0, { query: { enabled: !!activeConvId } });

  const { messages, isStreaming, sendMessage, stopStream, setInitialMessages } = useChatStream(activeConvId);

  useEffect(() => {
    if (activeConvData?.messages) {
      setInitialMessages(activeConvData.messages as any);
    } else {
      setInitialMessages([]);
    }
  }, [activeConvData, setInitialMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  useEffect(() => {
    if (conversations === undefined) return;
    if (conversations.length === 0 && !activeConvId) {
      handleNewChat();
    } else if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations]);

  // Auto-send career matches context when coming from Recommendations page
  useEffect(() => {
    if (!discussMode || !activeConvId || autoSentRef.current || isLoadingHistory) return;
    const stored = sessionStorage.getItem("careerRecommendations");
    if (!stored) return;
    try {
      const recs = JSON.parse(stored) as Array<{ careerTitle: string; matchPercentage: number; explanation: string; missingSkills: string[] }>;
      const summary = recs.slice(0, 3).map(r =>
        `• **${r.careerTitle}** (${r.matchPercentage}% match) — ${r.explanation} Missing skills: ${r.missingSkills.join(", ")}.`
      ).join("\n");
      const prompt = `I just got these career recommendations from PathAI:\n\n${summary}\n\nCan you help me understand which one suits me best and what I should focus on first?`;
      autoSentRef.current = true;
      sendMessage(prompt);
    } catch {}
  }, [discussMode, activeConvId, isLoadingHistory]);

  const handleNewChat = async () => {
    const title = discussMode ? "Career Matches Discussion" : "Career Discussion";
    const newConv = await createConv({ data: { title } });
    autoSentRef.current = false;
    setActiveConvId(newConv.id);
    refetchConvs();
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConv({ id }, {
      onSuccess: () => {
        if (activeConvId === id) {
          setActiveConvId(null);
          setInitialMessages([]); // immediately clear messages from UI
        }
        refetchConvs();
      }
    });
  };

  const handleSelectConv = (id: number) => {
    setInitialMessages([]); // clear while loading new conv
    setActiveConvId(id);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const QUICK_PROMPTS = discussMode
    ? ["Which career has best salary?", "How long to switch careers?", "What skills should I learn first?"]
    : ["What careers fit a CS dropout?", "How do I transition to UX Design?", "What is a prompt engineer?"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden pt-20 h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r border-white/10 glass-panel hidden md:flex flex-col">
          <div className="p-4 border-b border-white/10">
            <Button onClick={handleNewChat} className="w-full rounded-xl gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <PlusCircle className="w-4 h-4" /> New Career Chat
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {conversations?.map((conv) => (
                <div key={conv.id} onClick={() => handleSelectConv(conv.id)}
                  className={`p-3 rounded-xl cursor-pointer flex items-center justify-between group transition-colors ${activeConvId === conv.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeConvId === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium text-gray-200 truncate">{conv.title}</span>
                  </div>
                  <button onClick={(e) => handleDelete(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 hover:text-destructive rounded text-gray-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-3xl z-0" />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 space-y-6" ref={scrollRef}>
            {messages.length === 0 && !isLoadingHistory && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-white mb-2">
                  {discussMode ? "Discussing Your Career Matches" : "AI Career Advisor"}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {discussMode
                    ? "I've loaded your career matches. Ask me anything about them, or I'll analyse them automatically."
                    : "I'm powered by Gemini and trained to help you discover career paths, review your skills, and plan your future."}
                </p>
                <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-400" /> YouTube video recommendations appear after career questions
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map(q => (
                    <Badge key={q} variant="glass" className="cursor-pointer hover:bg-primary/20 hover:border-primary/50 text-sm py-2"
                      onClick={() => setInput(q)}>
                      "{q}"
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isLoadingHistory && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-secondary/20 border border-secondary/30' : 'bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-secondary" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`rounded-2xl p-5 ${msg.role === 'user' ? 'bg-secondary/10 border border-secondary/20 text-white rounded-tr-sm' : 'bg-black/40 border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-md'}`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content || (isStreaming && idx === messages.length - 1 ? '▌' : '')}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'assistant' && (msg as any).youtubeVideos?.length > 0 && (
                      <YoutubePanel videos={(msg as any).youtubeVideos} careerTopic={(msg as any).careerTopic} />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 z-10 border-t border-white/5 bg-background/50 backdrop-blur-xl">
            <form onSubmit={onSubmit} className="max-w-3xl mx-auto relative flex items-end gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about careers, skills, or your roadmap..."
                disabled={isStreaming || !activeConvId}
                className="pr-14 rounded-2xl h-14 bg-white/5 border-white/10 focus-visible:ring-primary/50 text-base shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              />
              {isStreaming ? (
                <Button type="button" onClick={stopStream} variant="destructive" size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-xl">
                  <div className="w-4 h-4 bg-white rounded-sm" />
                </Button>
              ) : (
                <Button type="submit" disabled={!input.trim() || !activeConvId} size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/80">
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </form>
            <p className="text-center text-xs text-muted-foreground mt-3">YouTube video suggestions auto-appear after career-related answers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
