import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

// Configure CORS for security
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your actual domain in production
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Development domains
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced security logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Log in production with security context
  if (process.env.NODE_ENV === 'production') {
    console.log(`${timestamp} ${req.method} ${req.url} - IP: ${clientIP} - UA: ${userAgent}`);
  } else {
    // Development logging with full details
    console.log(`${timestamp} ${req.method} ${req.url} - IP: ${clientIP}`);
  }
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Restrict referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://*.googleapis.com"
  );
  
  next();
});

app.use("/api", router);

export default app;
