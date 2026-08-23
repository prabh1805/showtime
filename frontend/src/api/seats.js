import { apiFetch } from "./client";

/** Generous page size for fetching a screen's full seat map in one request — matches the backend's own seat-number cap (@Max(500)), so no unpaginated endpoint is needed. */
const ALL_SEATS_PAGE_SIZE = 500;

/**
 * GET /api/v1/screens/{screenId}/seats — a screen's full seat list, fetched
 * as a single generously-sized page (see `ALL_SEATS_PAGE_SIZE`) since the
 * seat map needs every seat at once to render the diagram, not a page at a time.
 *
 * @param {number} screenId
 * @param {string} accessToken
 * @returns {Promise<Array<{ id: number, screenId: number, screenName: string, row: string, number: number, type: string, status: string, createdAt: string, updatedAt: string }>>}
 */
export async function listSeatsByScreen(screenId, accessToken) {
  const page = await apiFetch(
    `/api/v1/screens/${screenId}/seats?page=0&size=${ALL_SEATS_PAGE_SIZE}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return page.content;
}

/**
 * PATCH /api/v1/seats/{id} — update a seat's status (e.g. mark broken) or type.
 *
 * @param {number} seatId
 * @param {{ status?: string, type?: string }} payload
 * @param {string} accessToken
 * @returns {Promise<object>} the updated SeatResponse.
 * @throws {import("./client").ApiError} 403, 404.
 */
export function updateSeat(seatId, payload, accessToken) {
  return apiFetch(`/api/v1/seats/${seatId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/v1/seats/{id} — soft delete (sets status REMOVED).
 *
 * @param {number} seatId
 * @param {string} accessToken
 * @returns {Promise<null>}
 * @throws {import("./client").ApiError} 403, 404.
 */
export function deleteSeat(seatId, accessToken) {
  return apiFetch(`/api/v1/seats/${seatId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
