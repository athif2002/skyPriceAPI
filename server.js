import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const allowedOrigins = [
  "http://localhost:5173",          // local React (Vite)
  "http://localhost:3000",          // optional
  "https://your-frontend.vercel.app" // production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, n8n, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true
  })
);

// Handle preflight requests
app.options("*", cors());
const app = express();
app.use(express.json());

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const {
  MONGO_URI,
  API_KEY,
  DB_NAME = "skyPrice",
  COLLECTION = "flight_alerts"
} = process.env;

if (!MONGO_URI || !API_KEY) {
  throw new Error("Missing environment variables");
}

// ─────────────────────────────────────────────
// MongoDB connection (cached)
// ─────────────────────────────────────────────
let client;
async function getCollection() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client.db(DB_NAME).collection(COLLECTION);
}

// ─────────────────────────────────────────────
// Middleware: API key auth
// ─────────────────────────────────────────────
function authenticate(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ─────────────────────────────────────────────
// POST /v1/alerts/update
// ─────────────────────────────────────────────
app.post("/v1/alerts/update", authenticate, async (req, res) => {
  try {
    const { id, price } = req.body;

    // ── Validation
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid or missing id" });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ObjectId" });
    }

    const alerts = await getCollection();

    const result = await alerts.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          last_alert_price: price,
          last_alert_sent_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({
      success: true,
      updated: result.modifiedCount === 1
    });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Insert API
// ─────────────────────────────────────────────
// POST /v1/alerts/create
// ─────────────────────────────────────────────
app.post("/v1/alerts/create", authenticate, async (req, res) => {
  try {
    const { email, from, to, budget } = req.body;

    // ── Validation
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Invalid or missing email" });
    }

    if (!from || typeof from !== "string") {
      return res.status(400).json({ error: "Invalid or missing from" });
    }

    if (!to || typeof to !== "string") {
      return res.status(400).json({ error: "Invalid or missing to" });
    }

    if (typeof budget !== "number" || budget <= 0) {
      return res.status(400).json({ error: "Invalid budget" });
    }

    const alerts = await getCollection();

    const doc = {
      email,
      from,
      to,
      budget,
      created_at: new Date()
      // last_alert_price → intentionally omitted
      // last_alert_sent_at → intentionally omitted
    };

    const result = await alerts.insertOne(doc);

    res.status(201).json({
      success: true,
      id: result.insertedId.toString()
    });
  } catch (err) {
    console.error("Create failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ─────────────────────────────────────────────
app.listen(3000, () => {
  console.log("API running on port 3000");
});