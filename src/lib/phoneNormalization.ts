/**
 * Iraqi Phone Number Normalization Utility
 * Handles multiple Iraqi phone formats and converts to standardized formats
 */

export interface NormalizedPhone {
  /** International format: +9647508891221 */
  international: string;
  /** Local format: 07508891221 */
  local: string;
  /** Number only: 9647508891221 */
  numberOnly: string;
  /** For logging */
  original: string;
}

/**
 * Normalize an Iraqi phone number to multiple standardized formats
 * @param phone - Phone number in any format (07508891221, +9647508891221, 9647508891221, etc.)
 * @returns NormalizedPhone object with all formats
 */
export function normalizeIraqiPhone(phone: string | null | undefined): NormalizedPhone | null {
  if (!phone) return null;

  // Remove common separators and whitespace
  const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  console.log('[Phone Normalization] Input:', phone);
  console.log('[Phone Normalization] Cleaned:', cleaned);

  if (!cleaned || cleaned.length < 10) {
    console.log('[Phone Normalization] Invalid: too short');
    return null;
  }

  let numberOnly = cleaned;

  // Remove country code if present
  if (cleaned.startsWith('+964')) {
    numberOnly = cleaned.substring(4); // Remove +964
  } else if (cleaned.startsWith('964')) {
    numberOnly = cleaned.substring(3); // Remove 964
  } else if (cleaned.startsWith('00964')) {
    numberOnly = cleaned.substring(5); // Remove 00964
  }

  // Handle local format starting with 0
  if (numberOnly.startsWith('0')) {
    numberOnly = numberOnly.substring(1);
  }

  // Validate: should be 10 digits (without country code)
  if (!/^\d{10}$/.test(numberOnly)) {
    console.log('[Phone Normalization] Invalid: not 10 digits -', numberOnly);
    return null;
  }

  const local = `0${numberOnly}`;
  const international = `+964${numberOnly}`;
  const fullNumberOnly = `964${numberOnly}`;

  const result: NormalizedPhone = {
    international,
    local,
    numberOnly: fullNumberOnly,
    original: phone,
  };

  console.log('[Phone Normalization] Result:', result);
  return result;
}

/**
 * Check if two phone numbers match after normalization
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns true if both numbers normalize to the same value
 */
export function doPhoneNumbersMatch(phone1: string | null | undefined, phone2: string | null | undefined): boolean {
  const norm1 = normalizeIraqiPhone(phone1);
  const norm2 = normalizeIraqiPhone(phone2);

  if (!norm1 || !norm2) return false;

  // Compare using the local format as the standard
  const match = norm1.local === norm2.local;
  console.log('[Phone Match]', norm1.local, '===', norm2.local, '?', match);
  return match;
}

/**
 * Normalize a phone number for database comparison
 * Uses local format as the standard for consistency
 * @param phone - Phone number to normalize
 * @returns Normalized phone in local format (07508891221)
 */
export function normalizePhoneForDb(phone: string | null | undefined): string | null {
  const normalized = normalizeIraqiPhone(phone);
  return normalized?.local ?? null;
}
