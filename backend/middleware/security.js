import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Stricter rate limit for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// Data sanitization against NoSQL query injection
export const sanitizeData = mongoSanitize();

// Data sanitization against XSS
export const preventXSS = xss();

// Prevent HTTP Parameter Pollution
export const preventHPP = hpp({
  whitelist: [
    "price",
    "rating",
    "category",
    "tags",
  ],
});

// CORS configuration
export const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply all security middleware
export const applySecurityMiddleware = (app) => {
  app.use(securityHeaders);
  app.use("/api/", limiter);
  app.use("/api/auth/", authLimiter);
  app.use(sanitizeData);
  app.use(preventXSS);
  app.use(preventHPP);
};
