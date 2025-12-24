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
 * Validate alert creation data
 * @param {object} data - Alert data
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAlertCreation(data) {
  const { email, from, to, budget } = data;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return { valid: false, error: "Invalid or missing email" };
  }

  if (!from || typeof from !== "string" || from.trim().length === 0) {
    return { valid: false, error: "Invalid or missing from" };
  }

  if (!to || typeof to !== "string" || to.trim().length === 0) {
    return { valid: false, error: "Invalid or missing to" };
  }

  if (typeof budget !== "number" || budget <= 0) {
    return { valid: false, error: "Invalid budget" };
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

