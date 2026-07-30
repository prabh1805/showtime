import { apiFetch } from "./client";

/**
 * POST /api/v1/users/register — public signup. Always creates a CUSTOMER
 * (the backend hardcodes this role for self-registration).
 *
 * @param {{ email: string, password: string, firstName: string, lastName: string, mobileNumber?: string }} payload
 * @returns {Promise<{ id: number, email: string, firstName: string, lastName: string, mobileNumber: string|null, role: "CUSTOMER" }>}
 * @throws {import("./client").ApiError} 400 (validation) or 409 (duplicate email).
 */
export function register(payload) {
  // TODO: return apiFetch("/api/v1/users/register", { method: "POST", body: JSON.stringify(payload) });
}

/**
 * POST /api/v1/users/login — public. Returns only a token pair, no user info.
 *
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 * @throws {import("./client").ApiError} 400 (validation) or 401 (bad credentials).
 */
export function login(payload) {
  // TODO: same pattern as register(), path "/api/v1/users/login".
}

/**
 * POST /api/v1/users/refresh — exchanges a refresh token for a fresh
 * access/refresh token pair.
 *
 * @param {string} refreshToken
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 * @throws {import("./client").ApiError} 400 (validation) or 401 (invalid/expired token).
 */
export function refresh(refreshToken) {
  // TODO: apiFetch("/api/v1/users/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) });
}
