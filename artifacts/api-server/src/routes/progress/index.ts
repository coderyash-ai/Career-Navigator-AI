import { Router } from "express";
import { db, roadmapProgress, quizResults, users, battles } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../../middlewares/auth";

const router = Router();

router.get("/roadmap/:careerTitle", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { careerTitle } = req.params;
    const progress = await db.select().from(roadmapProgress)
      .where(and(eq(roadmapProgress.userId, req.userId!), eq(roadmapProgress.careerTitle, decodeURIComponent(careerTitle))));
    res.json(progress);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/roadmap/:careerTitle/:milestoneIndex", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { careerTitle, milestoneIndex } = req.params;
    const { completed } = req.body;
    const idx = parseInt(milestoneIndex);
    const title = decodeURIComponent(careerTitle);

    const existing = await db.select().from(roadmapProgress)
      .where(and(eq(roadmapProgress.userId, req.userId!), eq(roadmapProgress.careerTitle, title), eq(roadmapProgress.milestoneIndex, idx)))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(roadmapProgress)
        .set({ completed, completedAt: completed ? new Date() : null, updatedAt: new Date() })
        .where(eq(roadmapProgress.id, existing[0].id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(roadmapProgress).values({
        userId: req.userId!, careerTitle: title, milestoneIndex: idx,
        completed, completedAt: completed ? new Date() : null,
      }).returning();
      res.json(created);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/activity", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const quizHistory = await db.select().from(quizResults)
      .where(eq(quizResults.userId, req.userId!))
      .orderBy(desc(quizResults.createdAt))
      .limit(20);

    const battleHistory = await db.select().from(battles)
      .where(eq(battles.player1Id, req.userId!))
      .orderBy(desc(battles.createdAt))
      .limit(10);

    res.json({ quizHistory, battleHistory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await db.select({
      id: users.id,
      username: users.username,
      avatarId: users.avatarId,
      points: users.points,
      careerField: users.careerField,
    }).from(users).orderBy(desc(users.points)).limit(20);
    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
