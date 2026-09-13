import { apiFetch } from "./client";

/**
 * POST /api/v1/theaters/{theaterId}/staff — registers a new STAFF user and
 * attaches them to the given theater in one call. Caller must own or
 * actively staff the theater.
 *
 * @param {number} theaterId
 * @param {{ email: string, password: string, firstName: string, lastName: string, mobileNumber?: string }} payload
 * @param {string} accessToken
 * @returns {Promise<{ staffId: number, staffEmail: string, staffRole: string, staffEmploymentStatus: string }>}
 * @throws {import("./client").ApiError} 400 (validation), 403 (not owner/staff of theater),
 *   409 (duplicate email).
 */
export function addStaff(theaterId, payload, accessToken) {
  return apiFetch(`/api/v1/theaters/${theaterId}/staff`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}
