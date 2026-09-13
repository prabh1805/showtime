import { apiFetch } from "./client";

/**
 * POST /api/v1/shows — schedules a new show on a screen. Caller must own or
 * actively staff the screen's theater.
 *
 * @param {{ movieId: string, screenId: number, showTime: string, language: string, format: string, categoryPricing: Record<string, number> }} payload
 *   `showTime` is a `LocalDateTime` string with no timezone, e.g. "2026-01-01T19:45:00".
 *   `categoryPricing` keys are SeatType values (REGULAR/PREMIUM/RECLINER).
 * @param {string} accessToken
 * @returns {Promise<{ id: number, movieId: string, movieName: string, screenId: number, screenName: string, showTime: string, endTime: string, totalSeatsCreated: number, language: string, format: string, status: string }>}
 * @throws {import("./client").ApiError} 400 (validation), 403 (not owner/staff of theater),
 *   404 (unknown movie/screen), 409 (overlapping show on this screen),
 *   422 (archived movie, or movie doesn't support the requested format/language).
 */
export function createShow(payload, accessToken) {
  return apiFetch("/api/v1/shows", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/shows?theaterId= — every show scheduled across a theater's
 * screens, oldest first. Open endpoint (no auth required), but callers
 * here always pass a token since they're already in an authenticated
 * dashboard.
 *
 * @param {number} theaterId
 * @param {string} accessToken
 * @returns {Promise<Array<{ id: number, movieId: string, movieName: string, screenId: number, screenName: string, showTime: string, endTime: string, language: string, format: string, status: string }>>}
 * @throws {import("./client").ApiError} 404 (unknown theater).
 */
export function listShowsByTheater(theaterId, accessToken) {
  return apiFetch(`/api/v1/shows?theaterId=${theaterId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * GET /api/v1/shows/{id}/seats — the seat map for a show. Open endpoint (no
 * auth required), but callers here always pass a token since they're
 * already in an authenticated flow.
 *
 * @param {number} showId
 * @param {string} accessToken
 * @returns {Promise<Array<{ showSeatId: number, row: string, number: number, category: string, price: number, status: string }>>}
 *   `status` is one of AVAILABLE | LOCKED | BOOKED.
 * @throws {import("./client").ApiError} 404 (unknown show).
 */
export function getShowSeats(showId, accessToken) {
  return apiFetch(`/api/v1/shows/${showId}/seats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
