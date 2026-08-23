import { apiFetch } from "./client";

/**
 * GET /api/v1/theaters/me — theaters the logged-in user owns or actively
 * works at (Owner or STAFF).
 *
 * @param {string} accessToken
 * @returns {Promise<Array<{ id: number, city: string, name: string, address: string|null, status: string, ownerId: number, ownerName: string, ownerEmail: string, createdAt: string, updatedAt: string }>>}
 * @throws {import("./client").ApiError} 401 (missing/invalid token).
 */
export function getMyTheaters(accessToken) {
  return apiFetch("/api/v1/theaters/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
