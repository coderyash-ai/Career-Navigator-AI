import { useState, useRef, useCallback } from "react";
import type { GeminiMessage } from "@workspace/api-client-react";

export interface YoutubeVideo {
  title: string;
  channel: string;
  searchQuery: string;
  description: string;
  category: string;
}

export interface ChatMessage extends GeminiMessage {
  youtubeVideos?: YoutubeVideo[];
  careerTopic?: string;
}

async function fetchChatVideos(userMessage: string): Promise<{ videos: YoutubeVideo[]; careerTopic: string; isCareerRelated: boolean }> {
  const res = await fetch("/api/career/chat-videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage }),
  });
  if (!res.ok) return { videos: [], careerTopic: "", isCareerRelated: false };
  return res.json();
}

export function useChatStream(conversationId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;
    
    const userMsg: ChatMessage = {
      id: Date.now(),
      conversationId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setError(null);
    
    const assistantMsgId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        conversationId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      }
    ]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/gemini/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  setMessages((prev) => 
                    prev.map((msg) => 
                      msg.id === assistantMsgId 
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    )
                  );
                }
                if (data.done) {
                  done = true;
                }
                if (data.error) {
                  setError(data.error);
                  if (data.quotaExceeded) {
                    // Special handling for quota exceeded
                    setMessages((prev) => 
                      prev.map((msg) => 
                        msg.id === assistantMsgId 
                          ? { ...msg, content: `⚠️ ${data.error}\n\nPlease try again in a few moments. The AI service has reached its usage limit.` }
                          : msg
                      )
                    );
                  }
                  done = true;
                }
              } catch (e) {
                console.error("Error parsing SSE chunk", e);
              }
            }
          }
        }
      }

      // After streaming done, fetch YouTube videos in the background
      fetchChatVideos(content).then(({ videos, careerTopic, isCareerRelated }) => {
        if (isCareerRelated && videos.length > 0) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, youtubeVideos: videos, careerTopic }
                : msg
            )
          );
        }
      }).catch(() => {});

    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Stream aborted");
      } else {
        setError(err.message);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [conversationId]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const setInitialMessages = useCallback((msgs: GeminiMessage[]) => {
    setMessages(msgs as ChatMessage[]);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStream,
    setInitialMessages
  };
}
