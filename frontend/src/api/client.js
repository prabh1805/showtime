export const API_BASE_URL = "http://localhost:8081";

/**
 * Structured error thrown by `apiFetch` for any non-2xx response, so callers
 * can branch on `status` (e.g. 409 duplicate email, 401 invalid credentials)
 * instead of parsing raw Response objects.
 */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code.
   * @param {any} body - Parsed response body (JSON if available, otherwise raw text).
   */
  constructor(status, body) {
    super(
      (body && typeof body === "object" && body.message) ||
        `Request failed with status ${status}`
    );
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Thin fetch wrapper pointed at the Spring Boot backend. Handles base URL,
 * default headers, and turning non-2xx responses into a thrown ApiError with
 * a consistent shape. No auth/business logic here — token attachment will
 * hook in later via the `headers` option once login/refresh is built.
 *
 * @param {string} path - Path relative to the API base, e.g. "/api/v1/users/login".
 * @param {RequestInit} [options] - Standard fetch options (method, body, headers, ...).
 * @returns {Promise<any>} Parsed JSON response body, or `null` for empty (e.g. 204) responses.
 * @throws {ApiError} When the response status is not in the 2xx range.
 */
export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body || null;
}
