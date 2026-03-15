import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, authMiddleware, type AuthRequest } from "../../middlewares/auth";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";

const router = Router();

router.post("/register", rateLimitMiddleware(3), async (req: Request, res: Response) => {
  try {
    const { username, email, password, avatarId = 0 } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "All fields required" });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "Email already registered" });

    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername.length > 0) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ username, email, passwordHash, avatarId, points: 500 }).returning();
    const token = signToken(user.id, user.username);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatarId: user.avatarId, points: user.points, careerField: user.careerField } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  console.log(`Login attempt for email: ${req.body.email}`);
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log(`Login failed: Invalid password for email ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user.id, user.username);
    console.log(`Login successful: ${user.username} (ID: ${user.id})`);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatarId: user.avatarId, points: user.points, careerField: user.careerField } });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ id: user.id, username: user.username, email: user.email, avatarId: user.avatarId, points: user.points, careerField: user.careerField });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/profile", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { avatarId, careerField, username } = req.body;
    const updates: any = {};
    if (avatarId !== undefined) updates.avatarId = avatarId;
    if (careerField !== undefined) updates.careerField = careerField;
    if (username !== undefined) {
      const ex = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (ex.length > 0 && ex[0].id !== req.userId) return res.status(409).json({ error: "Username taken" });
      updates.username = username;
    }
    const [user] = await db.update(users).set(updates).where(eq(users.id, req.userId!)).returning();
    return res.json({ id: user.id, username: user.username, email: user.email, avatarId: user.avatarId, points: user.points, careerField: user.careerField });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
