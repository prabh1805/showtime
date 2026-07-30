/**
 * Password strength rule, kept byte-for-byte in sync with the backend's
 * @Pattern on RegisterRequest/CreateOwnerRequest/ChangePasswordRequest:
 * min 8 chars, at least one lowercase, one uppercase, one digit, and one
 * special character from the set @$!%*?&.
 */
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/** Human-readable hint to show near the password field. */
export const PASSWORD_REQUIREMENTS_MESSAGE =
  "At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).";

/**
 * Validates an email address is present and well-formed.
 *
 * @param {string} email
 * @returns {string | undefined} an error message, or undefined if valid.
 */
export function validateEmail(email) {
  // TODO: check non-empty, then a reasonable email shape (e.g. a simple
  // regex like /^[^\s@]+@[^\s@]+\.[^\s@]+$/ — doesn't need to be exhaustive,
  // the backend's @Email annotation is the real source of truth).
}

/**
 * Validates a password against PASSWORD_PATTERN.
 *
 * @param {string} password
 * @returns {string | undefined} an error message, or undefined if valid.
 */
export function validatePassword(password) {
  // TODO: check non-empty, then test against PASSWORD_PATTERN; on failure
  // return PASSWORD_REQUIREMENTS_MESSAGE (or a shorter variant).
}

/**
 * Validates a plain required text field.
 *
 * @param {string} value
 * @param {string} fieldLabel - used in the generated message, e.g. "First name".
 * @returns {string | undefined} an error message, or undefined if valid.
 */
export function validateRequired(value, fieldLabel) {
  // TODO: return `${fieldLabel} is required.` when value is empty/whitespace-only.
}

/**
 * Converts the backend's ErrorResponse.fieldErrors array into a
 * {field: message} map, so server- and client-side errors can both be
 * rendered through the same FormField `error` prop.
 *
 * @param {{field: string, message: string}[] | undefined} fieldErrors
 * @returns {Record<string, string>}
 */
export function mapFieldErrors(fieldErrors) {
  // TODO: return {} if fieldErrors is falsy/empty; otherwise reduce the
  // array into an object keyed by `field`.
}
