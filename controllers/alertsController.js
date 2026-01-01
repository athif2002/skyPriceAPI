import { ObjectId } from "mongodb";
import { getCollection, getClusterCollection } from "../config/database.js";
import {
  validateAlertCreation,
  validateAlertUpdate,
  validateEmailQuery,
  validateAlertEdit,
  validateAlertId,
  validateAndFormatDate,
  validateClusterCreation,
  validateClusterUpdate,
} from "../utils/validators.js";

/**
 * Format date to YYYY-MM-DD format
 * @param {string} date - Date string to format
 * @returns {string} Formatted date in YYYY-MM-DD format
 */
function formatDate(date) {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    departureDate,
    price_mode, 
    alert_type 
  } = req.body;
  
  const alerts = await getCollection();

  const doc = {
    email: email.trim().toLowerCase(),
    from: from.trim(),
    to: to.trim(),
    isNew: true,
    created_at: new Date(),
  };

  // Add budget only if provided (can be null or a number)
  if (budget !== undefined) {
    doc.budget = budget;
  }

  // Add optional fields if provided
  if (start_range !== undefined) {
    doc.start_range = formatDate(start_range);
  }
  if (end_range !== undefined) {
    doc.end_range = formatDate(end_range);
  }
  if (roundTrip !== undefined) {
    doc.roundTrip = roundTrip;
  }
  if (return_date !== undefined) {
    doc.return_date = formatDate(return_date);
  }
  if (departureDate !== undefined) {
    doc.departureDate = formatDate(departureDate);
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
    departureDate,
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
    updateFields.start_range = formatDate(start_range);
  }
  if (end_range !== undefined) {
    updateFields.end_range = formatDate(end_range);
  }
  if (roundTrip !== undefined) {
    updateFields.roundTrip = roundTrip;
  }
  if (return_date !== undefined) {
    updateFields.return_date = formatDate(return_date);
  }
  if (departureDate !== undefined) {
    updateFields.departureDate = formatDate(departureDate);
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

/**
 * Create a new cluster entry
 * POST /v1/alerts/cluster
 */
export async function createCluster(req, res) {
  // Comprehensive logging
  console.log('=== CREATE CLUSTER REQUEST ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.body type:', typeof req.body);
  console.log('req.body keys:', Object.keys(req.body || {}));
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  const validation = validateClusterCreation(req.body);
  console.log('Validation result:', JSON.stringify(validation, null, 2));

  if (!validation.valid) {
    console.log('VALIDATION FAILED - Returning 400');
    const response = {
      success: false,
      error: validation.error,
    };
    console.log('Response status: 400');
    console.log('Response body:', JSON.stringify(response, null, 2));
    return res.status(400).json(response);
  }

  console.log('VALIDATION PASSED - Proceeding with insert');
  const { alert_id, best_dates, from, to } = req.body;
  const clusterCollection = await getClusterCollection();

  const doc = {
    alert_id: alert_id,
    best_dates: best_dates,
    from: from.trim(),
    to: to.trim(),
    created_at: new Date(),
    last_refreshed_at: new Date(),
  };

  console.log('Document to insert:', JSON.stringify(doc, null, 2));

  const result = await clusterCollection.insertOne(doc);
  console.log('Insert result - insertedId:', result.insertedId.toString());

  // Update the alert's isNew field to false
  const alerts = await getCollection();
  const alertUpdateResult = await alerts.updateOne(
    { _id: new ObjectId(alert_id) },
    {
      $set: {
        isNew: false,
      },
    }
  );
  console.log('Alert update result - matchedCount:', alertUpdateResult.matchedCount, 'modifiedCount:', alertUpdateResult.modifiedCount);

  const response = {
    success: true,
    id: result.insertedId.toString(),
  };
  console.log('Response status: 201');
  console.log('Response body:', JSON.stringify(response, null, 2));
  console.log('=== CREATE CLUSTER REQUEST END ===\n');

  res.status(201).json(response);
}

/**
 * Update a cluster entry
 * PATCH /v1/alerts/cluster
 */
export async function updateCluster(req, res) {
  const validation = validateClusterUpdate(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const { alert_id, best_dates } = req.body;
  const clusterCollection = await getClusterCollection();

  const result = await clusterCollection.updateOne(
    { alert_id: alert_id },
    {
      $set: {
        best_dates: best_dates,
        last_refreshed_at: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      error: "Cluster not found",
    });
  }

  // Fetch updated document
  const updatedCluster = await clusterCollection.findOne({ alert_id: alert_id });

  res.json({
    success: true,
    updated: result.modifiedCount === 1,
    data: updatedCluster,
  });
}

