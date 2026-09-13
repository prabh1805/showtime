import { apiFetch } from "./client";

/**
 * GET /api/v1/theaters/{theaterId}/analytics — revenue (SUCCESS bookings
 * only), booking counts, and scheduled-show counts for a theater over the
 * trailing `days` days (inclusive of today). Every day in the window
 * appears in `dailyStats`, zero-filled, so it's chart-ready as-is. Caller
 * must own or actively staff the theater.
 *
 * @param {number} theaterId
 * @param {number} [days=30]
 * @param {string} accessToken
 * @returns {Promise<{
 *   totalRevenue: number,
 *   totalBookings: number,
 *   totalShows: number,
 *   dailyStats: Array<{ date: string, revenue: number, bookingsCount: number, showsCount: number }>,
 * }>}
 * @throws {import("./client").ApiError} 403 (not owner/staff of theater), 404 (unknown theater).
 */
export function getAnalytics(theaterId, days = 30, accessToken) {
  return apiFetch(`/api/v1/theaters/${theaterId}/analytics?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
