import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import {
  validateAlertCreation,
  validateAlertUpdate,
  validateEmailQuery,
} from "../utils/validators.js";

/**
 * Update an alert's price
 * POST /v1/alerts/update
 */
export async function updateAlert(req, res) {
  const validation = validateAlertUpdate(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const { id, price } = req.body;
  const alerts = await getCollection();

  const result = await alerts.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        last_alert_price: price,
        last_alert_sent_at: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      error: "Document not found",
    });
  }

  res.json({
    success: true,
    updated: result.modifiedCount === 1,
  });
}

/**
 * Create a new alert
 * POST /v1/alerts/create
 */
export async function createAlert(req, res) {
  const validation = validateAlertCreation(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const { email, from, to, budget } = req.body;
  const alerts = await getCollection();

  const doc = {
    email: email.trim().toLowerCase(),
    from: from.trim(),
    to: to.trim(),
    budget,
    created_at: new Date(),
  };

  const result = await alerts.insertOne(doc);

  res.status(201).json({
    success: true,
    id: result.insertedId.toString(),
  });
}

/**
 * Get alerts by email
 * GET /v1/alerts?email=
 */
export async function getAlerts(req, res) {
  const { email } = req.query;

  const validation = validateEmailQuery(email);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const alerts = await getCollection();

  const results = await alerts
    .find({ email: email.trim().toLowerCase() })
    .sort({ created_at: -1 })
    .toArray();

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
}

