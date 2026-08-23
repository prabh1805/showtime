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
 * @param {{ firstName: string, lastName: string, email: string, password: string, city: string, theaterName: string, address?: string }} payload
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

/**
 * GET /api/v1/admin/theaters — paginated, filterable, sortable theater
 * listing (backend-enforced ADMIN role). All filter fields are optional and
 * omitted from the query string when blank so the backend sees them as
 * absent rather than empty-string.
 *
 * @param {Object} params
 * @param {string} [params.ownerName] - matches against owner first/last name.
 * @param {string} [params.city] - exact city match.
 * @param {string} [params.theaterName] - substring match against theater name.
 * @param {number} [params.page=0] - zero-indexed page number.
 * @param {number} [params.size=20] - matches the backend's default-page-size.
 * @param {string|string[]} [params.sort] - Spring Data sort string(s), e.g. "createdAt,desc".
 * @param {string} accessToken - the logged-in admin's access token.
 * @returns {Promise<{content: object[], totalElements: number, totalPages: number, number: number, size: number, first: boolean, last: boolean}>}
 * @throws {import("./client").ApiError} 401/403 (bad/missing/wrong-role token).
 */
export function filterTheaters(params, accessToken) {
  const { ownerName, city, theaterName, page = 0, size = 20, sort } = params;
  const searchParams = new URLSearchParams();
  if (ownerName?.trim()) searchParams.set("ownerName", ownerName.trim());
  if (city?.trim()) searchParams.set("city", city.trim());
  if (theaterName?.trim()) searchParams.set("theaterName", theaterName.trim());
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));
  (Array.isArray(sort) ? sort : sort ? [sort] : []).forEach((s) =>
    searchParams.append("sort", s),
  );

  return apiFetch(`/api/v1/admin/theaters?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
