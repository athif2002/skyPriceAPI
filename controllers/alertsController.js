import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import {
  validateAlertCreation,
  validateAlertUpdate,
  validateEmailQuery,
  validateAlertEdit,
  validateAlertId,
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

  const { 
    email, 
    from, 
    to, 
    budget, 
    start_range, 
    end_range, 
    roundTrip, 
    return_date, 
    price_mode, 
    alert_type 
  } = req.body;
  
  const alerts = await getCollection();

  const doc = {
    email: email.trim().toLowerCase(),
    from: from.trim(),
    to: to.trim(),
    created_at: new Date(),
  };

  // Add budget only if provided (can be null or a number)
  if (budget !== undefined) {
    doc.budget = budget;
  }

  // Add optional fields if provided
  if (start_range !== undefined) {
    doc.start_range = start_range;
  }
  if (end_range !== undefined) {
    doc.end_range = end_range;
  }
  if (roundTrip !== undefined) {
    doc.roundTrip = roundTrip;
  }
  if (return_date !== undefined) {
    doc.return_date = return_date;
  }
  if (price_mode !== undefined) {
    doc.price_mode = price_mode.trim();
  }
  if (alert_type !== undefined) {
    doc.alert_type = alert_type.trim();
  }

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

/**
 * Edit an alert (partial update)
 * PATCH /v1/alerts/:id
 */
export async function editAlert(req, res) {
  const { id } = req.params;
  const updateData = { id, ...req.body };

  const validation = validateAlertEdit(updateData);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const { 
    email, 
    from, 
    to, 
    budget, 
    start_range, 
    end_range, 
    roundTrip, 
    return_date, 
    price_mode, 
    alert_type 
  } = req.body;
  
  const alerts = await getCollection();

  // Build update object with only provided fields
  const updateFields = {};
  
  if (email !== undefined) {
    updateFields.email = email.trim().toLowerCase();
  }
  if (from !== undefined) {
    updateFields.from = from.trim();
  }
  if (to !== undefined) {
    updateFields.to = to.trim();
  }
  if (budget !== undefined) {
    updateFields.budget = budget;
  }
  if (start_range !== undefined) {
    updateFields.start_range = start_range;
  }
  if (end_range !== undefined) {
    updateFields.end_range = end_range;
  }
  if (roundTrip !== undefined) {
    updateFields.roundTrip = roundTrip;
  }
  if (return_date !== undefined) {
    updateFields.return_date = return_date;
  }
  if (price_mode !== undefined) {
    updateFields.price_mode = price_mode.trim();
  }
  if (alert_type !== undefined) {
    updateFields.alert_type = alert_type.trim();
  }

  // Add updated_at timestamp
  updateFields.updated_at = new Date();

  const result = await alerts.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      error: "Alert not found",
    });
  }

  // Fetch updated document
  const updatedAlert = await alerts.findOne({ _id: new ObjectId(id) });

  res.json({
    success: true,
    updated: result.modifiedCount === 1,
    data: updatedAlert,
  });
}

/**
 * Delete an alert
 * DELETE /v1/alerts/:id
 */
export async function deleteAlert(req, res) {
  const { id } = req.params;

  const validation = validateAlertId(id);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const alerts = await getCollection();

  const result = await alerts.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      error: "Alert not found",
    });
  }

  res.json({
    success: true,
    message: "Alert deleted successfully",
  });
}

