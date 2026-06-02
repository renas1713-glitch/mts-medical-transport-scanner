/**
 * security.ts — MTS Security & GDPR Utilities
 *
 * Centralizes all security-relevant operations:
 *  - Input sanitization and validation
 *  - Address length limits (prevent injection / buffer abuse)
 *  - GDPR: secure in-memory data wiping
 *  - OCR confidence gating
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum allowed character length for an address field. */
export const MAX_ADDRESS_LENGTH = 300;

/** Minimum OCR confidence to accept a result without forcing manual review. */
export const MIN_CONFIDENCE_THRESHOLD = 0.6;

/** Characters that are not expected in a German address and signal a possible injection. */
const DISALLOWED_PATTERN = /[<>"'`;\\{}]/g;

// ─── Input Sanitization ───────────────────────────────────────────────────────

/**
 * Sanitizes a raw address string:
 *  1. Trims leading/trailing whitespace.
 *  2. Removes characters that could indicate script/injection attempts.
 *  3. Collapses multiple consecutive whitespace characters into one.
 *  4. Enforces a maximum length.
 *
 * @param raw - The unsanitized address string from OCR output or user input.
 * @returns A safe, trimmed address string.
 */
export const sanitizeAddress = (raw: string): string => {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    .trim()
    .replace(DISALLOWED_PATTERN, '')
    .replace(/\s+/g, ' ')
    .slice(0, MAX_ADDRESS_LENGTH);
};

// ─── Input Validation ─────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an address string for minimum plausibility.
 * Does NOT call any external API — purely local checks.
 */
export const validateAddress = (address: string): ValidationResult => {
  const sanitized = sanitizeAddress(address);

  if (!sanitized || sanitized.trim() === '') {
    return { valid: false, error: 'Adresse darf nicht leer sein.' };
  }
  if (sanitized.length < 5) {
    return { valid: false, error: 'Adresse ist zu kurz (mindestens 5 Zeichen).' };
  }
  // sanitizeAddress already slices to MAX_ADDRESS_LENGTH, so use >= to catch inputs
  // that were trimmed down to exactly the maximum limit (suspicious).
  if (sanitized.length >= MAX_ADDRESS_LENGTH) {
    return {
      valid: false,
      error: `Adresse ist zu lang (maximal ${MAX_ADDRESS_LENGTH - 1} Zeichen).`,
    };
  }

  // A German address should contain at least one digit (house number or PLZ)
  if (!/\d/.test(sanitized)) {
    return {
      valid: false,
      error: 'Adresse scheint keine Hausnummer oder PLZ zu enthalten.',
    };
  }

  return { valid: true };
};

/**
 * Validates that a confidence score is a proper number between 0 and 1.
 */
export const validateConfidence = (confidence: unknown): ValidationResult => {
  if (typeof confidence !== 'number' || isNaN(confidence)) {
    return { valid: false, error: 'Konfidenzwert muss eine Zahl sein.' };
  }
  if (confidence < 0 || confidence > 1) {
    return { valid: false, error: 'Konfidenzwert muss zwischen 0 und 1 liegen.' };
  }
  return { valid: true };
};

/**
 * Returns true if the OCR result confidence is high enough to skip manual review.
 */
export const isConfidenceSufficient = (confidence: number): boolean => {
  return confidence >= MIN_CONFIDENCE_THRESHOLD;
};

// ─── GDPR: Secure Data Clearing ───────────────────────────────────────────────

/**
 * Overwrites all string properties of an object with empty strings
 * and numeric properties with 0. This reduces the window during which
 * sensitive patient data stays in memory after processing.
 *
 * Usage: call this on an MTSFormData object immediately after saving it.
 *
 * @param obj - Any object whose fields should be cleared.
 */
export const secureClearObject = (obj: Record<string, unknown>): void => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      obj[key] = '';
    } else if (typeof val === 'number') {
      obj[key] = 0;
    } else if (typeof val === 'boolean') {
      obj[key] = false;
    } else if (val !== null && typeof val === 'object') {
      secureClearObject(val as Record<string, unknown>);
    }
  }
};

// ─── Trip ID Generation ───────────────────────────────────────────────────────

/**
 * Generates a collision-resistant trip ID without relying on external libraries.
 * Format: trip-<timestamp>-<random hex>
 */
export const generateTripId = (): string => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `trip-${ts}-${rand}`;
};
