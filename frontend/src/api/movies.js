import { apiFetch } from "./client";

/**
 * GET /api/v1/movies/tmdbSearch?query=… — proxied TMDB title search
 * (backend-enforced ADMIN role). Used to find movies to import; nothing is
 * persisted until `upsertMovies` is called with the chosen TMDB ids.
 *
 * @param {string} query - free-text movie title.
 * @param {string} accessToken
 * @returns {Promise<{ results: Array<{ id: number, title: string, overview: string, releaseDate: string|null, posterPath: string|null, backdropPath: string|null, adult: boolean }> }>}
 * @throws {import("./client").ApiError} 401/403 (bad/missing/wrong-role token),
 *   502 (TMDB unreachable or returned an error).
 */
export function searchTmdbMovies(query, accessToken) {
  return apiFetch(
    `/api/v1/movies/tmdbSearch?query=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

/**
 * POST /api/v1/movies/upsertMovies — imports (or refreshes) a batch of
 * movies by TMDB id (backend-enforced ADMIN role). Each id is processed
 * independently; the response has one entry per input id. A Success entry
 * carries `movieId` (the persisted id used when scheduling shows); a
 * Failure entry carries `reason` instead.
 *
 * @param {number[]} tmdbIds
 * @param {string} accessToken
 * @returns {Promise<Array<{ tmdbId: number, movieId?: string, title?: string, reason?: string }>>}
 * @throws {import("./client").ApiError} 401/403.
 */
export function upsertMovies(tmdbIds, accessToken) {
  return apiFetch("/api/v1/movies/upsertMovies", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(tmdbIds),
  });
}

/**
 * GET /api/v1/movies/getPages — paginated catalog of persisted movies
 * (backend-enforced ADMIN role), optionally filtered by a case-insensitive
 * title substring. This is the list whose `movieId` is referenced when a
 * show is created.
 *
 * @param {{ title?: string, page?: number, size?: number, sort?: string|string[] }} params
 * @param {string} accessToken
 * @returns {Promise<{ content: Array<{ movieId: string, title: string, releaseDate: string|null, status: string, duration: number, genre: string[], posterPath: string|null }>, totalElements: number, totalPages: number, number: number, size: number, first: boolean, last: boolean }>}
 * @throws {import("./client").ApiError} 401/403.
 */
export function getMoviesPage(params, accessToken) {
  const { title, page = 0, size = 20, sort } = params;
  const searchParams = new URLSearchParams();
  if (title?.trim()) searchParams.set("title", title.trim());
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));
  (Array.isArray(sort) ? sort : sort ? [sort] : []).forEach((s) =>
    searchParams.append("sort", s),
  );

  return apiFetch(`/api/v1/movies/getPages?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * GET /api/v1/movies/movieById/{id} — the full catalog record for one
 * movie (backend-enforced ADMIN role), including cast and artwork paths.
 *
 * @param {string} movieId
 * @param {string} accessToken
 * @returns {Promise<{ movieId: string, tmdbId: string, title: string, status: string, releaseDate: string|null, duration: number, genre: string[], cast: Array<{ name: string, character: string, order: number }>, posterPath: string|null, backdropPath: string|null }>}
 * @throws {import("./client").ApiError} 401/403, 404 (unknown id).
 */
export function getMovieById(movieId, accessToken) {
  return apiFetch(`/api/v1/movies/movieById/${encodeURIComponent(movieId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * GET /api/v1/movies/getForStaff — the movie catalog for picking a movie
 * when scheduling a show (backend-enforced STAFF or OWNER role). Unpaged.
 *
 * @param {{ title?: string, status?: string[] }} [params]
 * @param {string} accessToken
 * @returns {Promise<Array<{ movieId: string, title: string, releaseDate: string|null, status: string, duration: number, genre: string[], posterPath: string|null }>>}
 * @throws {import("./client").ApiError} 401/403.
 */
export function getMoviesForStaff(params = {}, accessToken) {
  const { title, status } = params;
  const searchParams = new URLSearchParams();
  if (title?.trim()) searchParams.set("title", title.trim());
  (status ?? []).forEach((s) => searchParams.append("status", s));

  return apiFetch(`/api/v1/movies/getForStaff?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
