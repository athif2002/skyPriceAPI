import { ObjectId } from "mongodb";

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid
 */
export function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * Validate date string
 * @param {string} date - Date string to validate
 * @returns {boolean} True if valid date
 */
export function isValidDate(date) {
  if (typeof date !== "string") return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
}

/**
 * Validate alert creation data
 * @param {object} data - Alert data
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAlertCreation(data) {
  const { email, from, to, budget, start_range, end_range, roundTrip, return_date, price_mode, alert_type } = data;

  // Required fields
  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return { valid: false, error: "Invalid or missing email" };
  }

  if (!from || typeof from !== "string" || from.trim().length === 0) {
    return { valid: false, error: "Invalid or missing from" };
  }

  if (!to || typeof to !== "string" || to.trim().length === 0) {
    return { valid: false, error: "Invalid or missing to" };
  }

  // Budget is optional - can be undefined, null, or a positive number
  if (budget !== undefined && budget !== null && (typeof budget !== "number" || budget <= 0)) {
    return { valid: false, error: "Invalid budget" };
  }

  // Optional fields validation
  if (start_range !== undefined) {
    if (typeof start_range !== "string" || !isValidDate(start_range)) {
      return { valid: false, error: "Invalid start_range date format" };
    }
  }

  if (end_range !== undefined) {
    if (typeof end_range !== "string" || !isValidDate(end_range)) {
      return { valid: false, error: "Invalid end_range date format" };
    }
  }

  if (roundTrip !== undefined) {
    if (typeof roundTrip !== "boolean") {
      return { valid: false, error: "roundTrip must be a boolean" };
    }
  }

  if (return_date !== undefined) {
    if (typeof return_date !== "string" || !isValidDate(return_date)) {
      return { valid: false, error: "Invalid return_date date format" };
    }
  }

  if (price_mode !== undefined) {
    if (typeof price_mode !== "string" || price_mode.trim().length === 0) {
      return { valid: false, error: "Invalid price_mode" };
    }
  }

  if (alert_type !== undefined) {
    if (typeof alert_type !== "string" || alert_type.trim().length === 0) {
      return { valid: false, error: "Invalid alert_type" };
    }
  }

  return { valid: true };
}

/**
 * Validate alert update data
 * @param {object} data - Update data
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAlertUpdate(data) {
  const { id, price } = data;

  if (!id || typeof id !== "string") {
    return { valid: false, error: "Invalid or missing id" };
  }

  if (!isValidObjectId(id)) {
    return { valid: false, error: "Invalid ObjectId format" };
  }

  if (typeof price !== "number" || price <= 0) {
    return { valid: false, error: "Invalid price" };
  }

  return { valid: true };
}

/**
 * Validate email query parameter
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateEmailQuery(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Invalid or missing email" };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Validate alert edit data (allows partial updates)
 * @param {object} data - Edit data
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAlertEdit(data) {
  const { id, email, from, to, budget, start_range, end_range, roundTrip, return_date, price_mode, alert_type } = data;

  // ID is required
  if (!id || typeof id !== "string") {
    return { valid: false, error: "Invalid or missing id" };
  }

  if (!isValidObjectId(id)) {
    return { valid: false, error: "Invalid ObjectId format" };
  }

  // At least one field must be provided for update
  const hasUpdateFields = 
    email !== undefined || 
    from !== undefined || 
    to !== undefined || 
    budget !== undefined ||
    start_range !== undefined ||
    end_range !== undefined ||
    roundTrip !== undefined ||
    return_date !== undefined ||
    price_mode !== undefined ||
    alert_type !== undefined;

  if (!hasUpdateFields) {
    return { valid: false, error: "At least one field must be provided for update" };
  }

  // Validate email if provided
  if (email !== undefined) {
    if (typeof email !== "string" || !isValidEmail(email)) {
      return { valid: false, error: "Invalid email format" };
    }
  }

  // Validate from if provided
  if (from !== undefined) {
    if (typeof from !== "string" || from.trim().length === 0) {
      return { valid: false, error: "Invalid from field" };
    }
  }

  // Validate to if provided
  if (to !== undefined) {
    if (typeof to !== "string" || to.trim().length === 0) {
      return { valid: false, error: "Invalid to field" };
    }
  }

  // Validate budget if provided
  if (budget !== undefined) {
    // Budget can be null or a positive number
    if (budget !== null && (typeof budget !== "number" || budget <= 0)) {
      return { valid: false, error: "Invalid budget" };
    }
  }

  // Validate optional date fields
  if (start_range !== undefined) {
    if (typeof start_range !== "string" || !isValidDate(start_range)) {
      return { valid: false, error: "Invalid start_range date format" };
    }
  }

  if (end_range !== undefined) {
    if (typeof end_range !== "string" || !isValidDate(end_range)) {
      return { valid: false, error: "Invalid end_range date format" };
    }
  }

  if (roundTrip !== undefined) {
    if (typeof roundTrip !== "boolean") {
      return { valid: false, error: "roundTrip must be a boolean" };
    }
  }

  if (return_date !== undefined) {
    if (typeof return_date !== "string" || !isValidDate(return_date)) {
      return { valid: false, error: "Invalid return_date date format" };
    }
  }

  if (price_mode !== undefined) {
    if (typeof price_mode !== "string" || price_mode.trim().length === 0) {
      return { valid: false, error: "Invalid price_mode" };
    }
  }

  if (alert_type !== undefined) {
    if (typeof alert_type !== "string" || alert_type.trim().length === 0) {
      return { valid: false, error: "Invalid alert_type" };
    }
  }

  return { valid: true };
}

/**
 * Validate alert ID parameter
 * @param {string} id - ID to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAlertId(id) {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "Invalid or missing id" };
  }

  if (!isValidObjectId(id)) {
    return { valid: false, error: "Invalid ObjectId format" };
  }

  return { valid: true };
}

