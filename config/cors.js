import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "https://your-frontend.vercel.app", // Update with your production frontend URL
];

/**
 * CORS configuration middleware
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, n8n, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export default cors(corsOptions);

