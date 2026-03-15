import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "career-ai-secret-key-2025";

export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log(`Auth middleware called for ${req.method} ${req.path}, auth header:`, authHeader ? "present" : "missing");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Auth failed: No valid Bearer token found");
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    console.log(`Auth success: User ${payload.username} (ID: ${payload.userId})`);
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch (error) {
    console.log("Auth failed: Invalid or expired token", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function signToken(userId: number, username: string) {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: "30d" });
}
