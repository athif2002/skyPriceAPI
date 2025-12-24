import express from "express";
import {
  updateAlert,
  createAlert,
  getAlerts,
} from "../controllers/alertsController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// POST /v1/alerts/update
router.post("/update", asyncHandler(updateAlert));

// POST /v1/alerts/create
router.post("/create", asyncHandler(createAlert));

// GET /v1/alerts?email=
router.get("/", asyncHandler(getAlerts));

export default router;

