const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "chrome-extension://*/";

// Configure rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window by default
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(
    cors({
        origin: CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(limiter);

// Routes
app.get("/", (req, res) => {
    res.json({ message: "AI-Powered Bookmark Organizer API is running" });
});

// API routes
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));

// TODO: Add more routes as needed
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));

// Import logger
const logger = require("./utils/logger");

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`${err.message}`, {
        error: err,
        path: req.path,
        method: req.method,
    });

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong!",
        error: NODE_ENV === "development" ? err.stack : undefined,
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    logger.info(`API available at http://localhost:${PORT}`);
});

module.exports = app;
