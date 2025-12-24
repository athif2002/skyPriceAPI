import "dotenv/config";
import express from "express";
import cors from "cors";
import alertsRoutes from "./routes/alerts.js";
import { errorHandler } from "./middleware/errorHandler.js";
import corsConfig from "./config/cors.js";

const app = express();

// Middleware
app.use(express.json());
app.use(corsConfig);

// Handle preflight requests
app.options("*", cors());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/v1/alerts", alertsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Validate environment variables
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI environment variable is required");
  process.exit(1);
}

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  const { closeConnection } = await import("./config/database.js");
  await closeConnection();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  const { closeConnection } = await import("./config/database.js");
  await closeConnection();
  process.exit(0);
});
