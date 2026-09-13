import { apiFetch } from "./client";

/**
 * POST /api/v1/bookings — locks the given seats for the show and creates a
 * Razorpay order for their total price. The booking (and its seat locks)
 * expires after a short hold window if payment isn't verified in time.
 *
 * @param {{ showId: number, showSeatIds: number[] }} payload
 * @param {string} accessToken
 * @returns {Promise<{ id: number, showId: number, amount: number, currency: string, razorpayOrderId: string, razorpayKeyId: string, status: string, expiresAt: string }>}
 * @throws {import("./client").ApiError} 400 (validation), 404 (unknown show),
 *   409 (one or more seats no longer AVAILABLE), 502 (Razorpay order creation failed).
 */
export function createBooking(payload, accessToken) {
  return apiFetch("/api/v1/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/v1/bookings/{id}/verify — verifies the Razorpay checkout
 * signature returned by the Checkout.js `handler` callback, finalizing the
 * booking (seats -> BOOKED) on success.
 *
 * @param {number} bookingId
 * @param {{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }} payload
 * @param {string} accessToken
 * @returns {Promise<{ id: number, showId: number, amount: number, currency: string, razorpayOrderId: string, razorpayKeyId: string, status: string, expiresAt: string }>}
 * @throws {import("./client").ApiError} 403 (not this booking's owner), 404 (unknown booking),
 *   422 (signature mismatch, order id mismatch, or booking already expired/not INITIATED).
 */
export function verifyPayment(bookingId, payload, accessToken) {
  return apiFetch(`/api/v1/bookings/${bookingId}/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/bookings/{id} — current status of a booking.
 *
 * @param {number} bookingId
 * @param {string} accessToken
 * @returns {Promise<{ id: number, showId: number, amount: number, currency: string, razorpayOrderId: string, razorpayKeyId: string, status: string, expiresAt: string }>}
 * @throws {import("./client").ApiError} 403 (not this booking's owner), 404 (unknown booking).
 */
export function getBooking(bookingId, accessToken) {
  return apiFetch(`/api/v1/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
