import { Router, type Response } from "express";
import { db, battles, battleAnswers, quizResults, users } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../../middlewares/auth";
import { ai } from "@workspace/integrations-gemini-ai";
import type { Server as SocketServer } from "socket.io";

// Input validation helper
function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

function validateCareerField(field: any): string {
  const sanitized = sanitizeString(field);
  if (!sanitized || sanitized.length < 2 || sanitized.length > 100) {
    throw new Error('Career field must be between 2-100 characters');
  }
  return sanitized;
}

const router = Router();

let io: SocketServer;
export function setBattleIo(socketIo: SocketServer) { io = socketIo; }

async function generateBattleQuestions(careerField: string): Promise<any[]> {
  const prompt = `Generate 5 multiple-choice quiz questions for someone learning ${careerField}.
Respond with ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A",
      "explanation": "brief explanation"
    }
  ]
}`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 2048, responseMimeType: "application/json" },
  });
  const parsed = JSON.parse(response.text ?? "{}");
  return parsed.questions ?? [];
}

router.post("/create", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { careerField } = req.body;
    if (!careerField) return res.status(400).json({ error: "careerField required" });

    // Validate and sanitize input
    const sanitizedCareerField = validateCareerField(careerField);

    const waiting = await db.select().from(battles)
      .where(and(eq(battles.status, "waiting"), eq(battles.careerField, sanitizedCareerField)))
      .limit(1);

    if (waiting.length > 0 && waiting[0].player1Id !== req.userId) {
      const battle = waiting[0];
      const questions = await generateBattleQuestions(sanitizedCareerField);
      const [updated] = await db.update(battles)
        .set({ player2Id: req.userId, status: "active", questions })
        .where(eq(battles.id, battle.id))
        .returning();
      if (io) io.to(`battle-${battle.id}`).emit("battle-start", { battle: updated, questions });
      return res.json({ battle: updated, questions, role: "player2" });
    }

    const [battle] = await db.insert(battles)
      .values({ player1Id: req.userId!, careerField: sanitizedCareerField, status: "waiting" })
      .returning();
    return res.json({ battle, role: "player1" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:battleId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const battleId = parseInt(req.params.battleId as string);
    if (isNaN(battleId)) return res.status(400).json({ error: "Invalid battle ID" });
    
    const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1);
    if (!battle) return res.status(404).json({ error: "Battle not found" });
    return res.json(battle);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:battleId/answer", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { questionIndex, answer, timeTaken } = req.body;
    const battleId = parseInt(req.params.battleId as string);

    // Validate inputs
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return res.status(400).json({ error: "Invalid question index" });
    }
    if (typeof answer !== 'string' || !answer.trim()) {
      return res.status(400).json({ error: "Answer is required" });
    }
    if (typeof timeTaken !== 'number' || timeTaken < 0) {
      return res.status(400).json({ error: "Invalid time taken" });
    }

    const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1);
    if (!battle || !battle.questions) return res.status(404).json({ error: "Battle not found" });

    const questions = battle.questions as any[];
    const q = questions[questionIndex];
    const isCorrect = q?.correctAnswer === answer;

    await db.insert(battleAnswers).values({ battleId, userId: req.userId!, questionIndex, answer, isCorrect, timeTaken });

    const allAnswers = await db.select().from(battleAnswers).where(eq(battleAnswers.battleId, battleId));
    const p1Answers = allAnswers.filter((a: any) => a.userId === battle.player1Id);
    const p2Answers = allAnswers.filter((a: any) => a.userId === battle.player2Id);
    const totalQ = questions.length;

    if (p1Answers.length === totalQ && p2Answers.length === totalQ) {
      const p1Score = p1Answers.filter((a: any) => a.isCorrect).length;
      const p2Score = p2Answers.filter((a: any) => a.isCorrect).length;
      const winnerId = p1Score > p2Score ? battle.player1Id : p2Score > p1Score ? battle.player2Id : null;
      const pointsAwarded = 75;

      const [finishedBattle] = await db.update(battles).set({
        status: "finished", winnerId, player1Score: p1Score, player2Score: p2Score, finishedAt: new Date(),
      }).where(eq(battles.id, battleId)).returning();

      if (winnerId) {
        await db.update(users).set({ points: sql`points + ${pointsAwarded}` }).where(eq(users.id, winnerId));
        if (io) io.to(`battle-${battleId}`).emit("battle-end", { battle: finishedBattle });
      }
      return res.json({ battle: finishedBattle, winner: winnerId === req.userId });
    }

    return res.json({ success: true, isCorrect });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:battleId/status", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const battleId = parseInt(req.params.battleId as string);
    if (isNaN(battleId)) return res.status(400).json({ error: "Invalid battle ID" });
    
    const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1);
    if (!battle) return res.status(404).json({ error: "Battle not found" });
    return res.json(battle);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
