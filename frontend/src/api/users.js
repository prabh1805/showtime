import { apiFetch } from "./client";

/**
 * GET /api/v1/users/me — returns the authenticated user's own profile.
 *
 * @param {string} accessToken
 * @returns {Promise<{ id: number, email: string, firstName: string, lastName: string, mobileNumber: string|null, role: string }>}
 * @throws {import("./client").ApiError} 401 (missing/invalid token).
 */
export function getMe(accessToken) {
  return apiFetch("/api/v1/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
