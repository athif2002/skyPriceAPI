import express from "express";
import {
  updateAlert,
  createAlert,
  getAlerts,
  editAlert,
  deleteAlert,
} from "../controllers/alertsController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// POST /v1/alerts/update
router.post("/update", asyncHandler(updateAlert));

// POST /v1/alerts/create
router.post("/create", asyncHandler(createAlert));

// GET /v1/alerts?email=
router.get("/", asyncHandler(getAlerts));

// PATCH /v1/alerts/:id - Edit alert (partial update)
router.patch("/:id", asyncHandler(editAlert));

// DELETE /v1/alerts/:id - Delete alert
router.delete("/:id", asyncHandler(deleteAlert));

export default router;

