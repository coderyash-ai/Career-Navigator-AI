import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Rate limiting configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = {
  '/api/auth/login': 5,      // 5 login attempts per 15 minutes
  '/api/auth/register': 3,    // 3 registrations per 15 minutes
  '/api/career/recommendations': 10, // 10 recommendations per 15 minutes
  '/api/gemini/conversations': 20, // 20 messages per 15 minutes
  '/api/battle/create': 5,    // 5 battle creations per 15 minutes
};

function getClientIdentifier(req: Request): string {
  return req.ip || 'unknown';
}

function getRateLimitKey(req: Request): string {
  const clientIp = getClientIdentifier(req);
  const path = req.path;
  return `${clientIp}:${path}`;
}

export function rateLimitMiddleware(maxRequests?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getRateLimitKey(req);
    const now = Date.now();
    const limit = maxRequests || MAX_REQUESTS[req.path as keyof typeof MAX_REQUESTS] || 100;

    // Initialize or reset window
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + WINDOW_MS
      };
    } else {
      store[key].count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    if (store[key].count > limit) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        limit,
        window: WINDOW_MS / 1000 / 60 // in minutes
      });
    }

    return next();
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, WINDOW_MS);
