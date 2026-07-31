import { apiFetch } from "./client";

/**
 * POST /api/v1/admin/owner — the only backend endpoint currently enforced
 * by Spring Security (requires a Bearer token whose JWT `role` claim is
 * ADMIN). Creates an Owner user and their first theater in one call.
 *
 * Build `payload` so `address` is OMITTED entirely when blank — the
 * backend's @Size(min=1) on that field rejects an empty string but allows
 * the key being absent.
 *
 * @param {{ email: string, password: string, city: string, theaterName: string, address?: string }} payload
 * @param {string} accessToken - the logged-in admin's access token.
 * @returns {Promise<{ ownerId: number, theaterId: number }>}
 * @throws {import("./client").ApiError} 400 (validation), 401/403 (bad/missing/wrong-role token).
 */
export function createOwner(payload, accessToken) {
  // TODO: apiFetch("/api/v1/admin/owner", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${accessToken}` },
  //   body: JSON.stringify(payload),
  // });
  const { address, ...rest } = payload;
  const body = { ...rest, ...(address ? { address } : {}) };
  return apiFetch("/api/v1/admin/owner", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
}
