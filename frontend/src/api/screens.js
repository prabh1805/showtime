import { apiFetch } from "./client";

/**
 * POST /api/v1/screens — creates a screen and its initial seat layout in
 * one call (row-segment based; see `ScreenLayoutBuilder`). Caller must own
 * or actively staff the target theater.
 *
 * @param {{ theaterId: number, name: string, type: string, status?: string, bufferMinutes: number, rowSegmentRequests: Array<{ row: string, seatType: string, startNumber: number, count: number }> }} payload
 * @param {string} accessToken
 * @returns {Promise<{ id: number, theaterId: number, theaterCity: string, theaterName: string, name: string, status: string, type: string, bufferMinutes: number, createdAt: string, updatedAt: string }>}
 * @throws {import("./client").ApiError} 400 (validation), 403 (not owner/staff of theater), 409 (duplicate name or overlapping seats).
 */
export function createScreen(payload, accessToken) {
  return apiFetch("/api/v1/screens", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/theaters/{theaterId}/screens — paginated list of a theater's
 * screens. Public endpoint (no auth required), but callers here always pass
 * a token since they're already in an authenticated dashboard.
 *
 * @param {number} theaterId
 * @param {{ page?: number, size?: number, sort?: string|string[] }} [params]
 * @param {string} accessToken
 * @returns {Promise<{content: object[], totalElements: number, totalPages: number, number: number, size: number, first: boolean, last: boolean}>}
 */
export function listScreensByTheater(theaterId, params = {}, accessToken) {
  const { page = 0, size = 20, sort } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));
  (Array.isArray(sort) ? sort : sort ? [sort] : []).forEach((s) =>
    searchParams.append("sort", s),
  );

  return apiFetch(
    `/api/v1/theaters/${theaterId}/screens?${searchParams.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

/**
 * PATCH /api/v1/screens/{id} — partial update (only non-omitted fields are
 * applied server-side). Caller must own or actively staff the screen's theater.
 *
 * @param {number} screenId
 * @param {{ name?: string, type?: string, status?: string, bufferMinutes?: number }} payload
 * @param {string} accessToken
 * @returns {Promise<object>} the updated ScreenResponse.
 * @throws {import("./client").ApiError} 400, 403, 404, 409 (duplicate name).
 */
export function updateScreen(screenId, payload, accessToken) {
  return apiFetch(`/api/v1/screens/${screenId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/v1/screens/{id} — soft delete (sets status PERMANENTLY_CLOSED).
 *
 * @param {number} screenId
 * @param {string} accessToken
 * @returns {Promise<null>}
 * @throws {import("./client").ApiError} 403, 404.
 */
export function deleteScreen(screenId, accessToken) {
  return apiFetch(`/api/v1/screens/${screenId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * POST /api/v1/screens/{id}/seats — appends more row-segments (seats) to an
 * existing screen's layout. Same row-segment shape as `createScreen`.
 *
 * @param {number} screenId
 * @param {Array<{ row: string, seatType: string, startNumber: number, count: number }>} rowSegmentRequests
 * @param {string} accessToken
 * @returns {Promise<object>} the ScreenResponse.
 * @throws {import("./client").ApiError} 400, 403, 404, 409 (overlapping/duplicate seats).
 */
export function addSeatsToScreen(screenId, rowSegmentRequests, accessToken) {
  return apiFetch(`/api/v1/screens/${screenId}/seats`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ rowSegmentRequests }),
  });
}
