import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Trash2, PlusCircle, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useListGeminiConversations, useCreateGeminiConversation, useDeleteGeminiConversation, useGetGeminiConversation } from "@workspace/api-client-react";

export default function Chat() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // APIs
  const { data: conversations, refetch: refetchConvs } = useListGeminiConversations();
  const { mutateAsync: createConv } = useCreateGeminiConversation();
  const { mutate: deleteConv } = useDeleteGeminiConversation();
  const { data: activeConvData, isFetching: isLoadingHistory } = useGetGeminiConversation(activeConvId || 0, { query: { enabled: !!activeConvId } });

  // Stream Hook
  const { messages, isStreaming, sendMessage, stopStream, setInitialMessages } = useChatStream(activeConvId);

  // Sync loaded history to stream state
  useEffect(() => {
    if (activeConvData?.messages) {
      setInitialMessages(activeConvData.messages as any);
    } else {
      setInitialMessages([]);
    }
  }, [activeConvData, setInitialMessages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversations && conversations.length === 0 && !activeConvId) {
      handleNewChat();
    } else if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleNewChat = async () => {
    const newConv = await createConv({ data: { title: "Career Discussion" } });
    setActiveConvId(newConv.id);
    refetchConvs();
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConv({ id }, {
      onSuccess: () => {
        if (activeConvId === id) setActiveConvId(null);
        refetchConvs();
      }
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    sendMessage(input);
    setInput("");
  };

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
                <div 
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3 rounded-xl cursor-pointer flex items-center justify-between group transition-colors ${
                    activeConvId === conv.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeConvId === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium text-gray-200 truncate">{conv.title}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, conv.id)}
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
        <div className="flex-1 flex flex-col relative bg-[url('/images/space-bg.png')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-3xl z-0" />
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 space-y-6" ref={scrollRef}>
            {messages.length === 0 && !isLoadingHistory && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-white mb-2">AI Career Advisor</h2>
                <p className="text-muted-foreground">
                  I'm powered by Gemini and trained to help you discover career paths, review your skills, and plan your future. Ask me anything!
                </p>
                
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {["What careers fit a CS dropout?", "How do I transition to UX Design?", "What is a prompt engineer?"].map(q => (
                    <Badge 
                      key={q} 
                      variant="glass" 
                      className="cursor-pointer hover:bg-primary/20 hover:border-primary/50 text-sm py-2"
                      onClick={() => { setInput(q); }}
                    >
                      "{q}"
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-secondary/20 border border-secondary/30' : 'bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-secondary" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  
                  <div className={`rounded-2xl p-5 ${
                    msg.role === 'user' 
                      ? 'bg-secondary/10 border border-secondary/20 text-white rounded-tr-sm' 
                      : 'bg-black/40 border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-md'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || (isStreaming && idx === messages.length - 1 ? '...' : '')}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 z-10 border-t border-white/5 bg-background/50 backdrop-blur-xl">
            <form onSubmit={onSubmit} className="max-w-3xl mx-auto relative flex items-end gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about careers, skills, or your roadmap..."
                disabled={isStreaming || !activeConvId}
                className="pr-14 rounded-2xl h-14 bg-white/5 border-white/10 focus-visible:ring-primary/50 text-base shadow-[0_0_15px_rgba(0,0,0,0.5)] inset-shadow-sm"
              />
              {isStreaming ? (
                <Button 
                  type="button" 
                  onClick={stopStream}
                  variant="destructive" 
                  size="icon" 
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl"
                >
                  <div className="w-4 h-4 bg-white rounded-sm" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={!input.trim() || !activeConvId}
                  size="icon" 
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/80"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </form>
            <p className="text-center text-xs text-muted-foreground mt-3">
              AI can make mistakes. Verify important career decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
