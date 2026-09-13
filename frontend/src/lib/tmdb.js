const IMAGE_BASE = "https://image.tmdb.org/t/p";

/**
 * Build a TMDB image URL, or null when there's no path.
 *
 * @param {string|null|undefined} path - e.g. "/abc123.jpg" (as returned by the API).
 * @param {"w92"|"w154"|"w185"|"w342"|"w500"|"w780"|"original"} [size="w342"]
 * @returns {string|null}
 */
export function tmdbImage(path, size = "w342") {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/**
 * Runtime in minutes -> "2h 46m" / "48m". Returns "" for 0 / falsy.
 *
 * @param {number} minutes
 * @returns {string}
 */
export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
}

/** "2010-07-15" -> "2010"; falsy -> null */
export function releaseYear(isoDate) {
  return isoDate ? isoDate.slice(0, 4) : null;
}

/** Public TMDB website page for a movie id. */
export function tmdbMovieUrl(tmdbId) {
  return `https://www.themoviedb.org/movie/${tmdbId}`;
}
