import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import {
  CreateGeminiConversationBody,
  SendGeminiMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/conversations", async (_req, res) => {
  try {
    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(asc(conversations.createdAt));
    res.json(allConversations);
  } catch (err: any) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const body = CreateGeminiConversationBody.parse(req.body);
    const [created] = await db
      .insert(conversations)
      .values({ title: body.title })
      .returning();
    res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conv.length) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    res.json({ ...conv[0], messages: msgs });
  } catch (err: any) {
    console.error("Error fetching conversation details:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conv.length) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).send();
  } catch (err: any) {
    console.error("Error deleting conversation:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));
    res.json(msgs);
  } catch (err: any) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const convId = parseInt(req.params.id);
    const body = SendGeminiMessageBody.parse(req.body);

    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .limit(1);

    if (!conv.length) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messages).values({
      conversationId: convId,
      role: "user",
      content: body.content,
    });

    const chatHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(asc(messages.createdAt));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const systemPrompt = `You are PathAI, an expert AI career counselor and educational advisor specifically designed to help students explore career paths. You provide personalized guidance on career planning, skill development, and educational roadmaps. 

Your role is to:
- Help students discover career paths that match their skills and interests
- Provide detailed, actionable roadmaps for career transitions
- Suggest specific resources, courses, and projects
- Answer questions about job markets, required skills, and growth opportunities
- Be encouraging, specific, and practical in your advice

Always be warm, supportive, and motivating while remaining realistic about timelines and requirements.`;

    const geminiMessages = [
      {
        role: "user" as const,
        parts: [{ text: systemPrompt + "\n\nRemember your role as PathAI. Now let's start our conversation." }],
      },
      {
        role: "model" as const,
        parts: [{ text: "I'm PathAI, your personal AI career counselor. I'm here to help you explore career paths, build skill roadmaps, and guide your educational journey. What career questions can I help you with today?" }],
      },
      ...chatHistory.map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      })),
    ];

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: geminiMessages,
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: convId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Error in /conversations/:id/messages:", err);
    
    // Handle quota exceeded error specifically
    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('billing')) {
      const quotaError = {
        error: "AI service temporarily unavailable due to quota limits. Please try again later.",
        quotaExceeded: true,
        retryAfter: "13s"
      };
      
      if (!res.headersSent) {
        res.status(429).json(quotaError);
      } else {
        res.write(`data: ${JSON.stringify(quotaError)}\n\n`);
        res.end();
      }
      return;
    }
    
    // If headers haven't been sent, we can send a standard JSON error
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      // If we're already streaming, we should send an error event and end the stream
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
