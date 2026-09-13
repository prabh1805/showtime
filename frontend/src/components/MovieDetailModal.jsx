import { useEffect, useState } from "react";
import Modal from "./Modal";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import { getMovieById } from "../api/movies";
import { ApiError } from "../api/client";
import { formatEnumLabel } from "../lib/format";
import { tmdbImage, formatRuntime, releaseYear, tmdbMovieUrl } from "../lib/tmdb";
import { MOVIE_STATUS_STYLES, MOVIE_STATUS_FALLBACK } from "../lib/movieStatus";
import { useAuth } from "../context/useAuth";

const MAX_CAST = 12;

/**
 * Full-detail view for one catalog movie: backdrop banner, overlapping
 * poster, meta row, genre pills, cast list, and the catalog id (with
 * copy) plus a link out to TMDB. Fetches GET /api/v1/movies/movieById/{id}
 * on mount — render it only while a movieId is selected, so each open is a
 * fresh fetch.
 *
 * @param {{ movieId: string, onClose: () => void }} props
 */
export default function MovieDetailModal({ movieId, onClose }) {
  const { accessToken } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMovieById(movieId, accessToken)
      .then((data) => {
        if (!cancelled) setMovie(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.body?.message || "Couldn't load this movie."
              : "Couldn't load this movie.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [movieId, accessToken]);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(movieId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — the id is still on screen.
    }
  }

  const backdrop = movie && tmdbImage(movie.backdropPath, "w780");
  const poster = movie && tmdbImage(movie.posterPath, "w342");
  const year = movie && releaseYear(movie.releaseDate);
  const runtime = movie ? formatRuntime(movie.duration) : "";
  const cast = movie?.cast
    ? [...movie.cast].sort((a, b) => a.order - b.order).slice(0, MAX_CAST)
    : [];

  return (
    <Modal
      open
      onClose={onClose}
      title={movie?.title || "Movie"}
      maxWidthClassName="max-w-3xl"
    >
      {loading ? (
        <LoadingBlock label="Loading movie…" className="mt-6" />
      ) : error ? (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      ) : movie ? (
        <div className="mt-4">
          <div className="relative h-40 overflow-hidden rounded-xl sm:h-48">
            {backdrop ? (
              <img
                src={backdrop}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-velvet/25 to-marquee/25" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/30 to-transparent" />
          </div>

          <div className="relative -mt-16 flex gap-4 px-1 sm:-mt-20">
            {poster ? (
              <img
                src={poster}
                alt=""
                className="h-40 w-27 shrink-0 rounded-lg object-cover shadow-lg ring-1 ring-hairline sm:h-52 sm:w-35"
              />
            ) : (
              <div className="flex h-40 w-27 shrink-0 items-center justify-center rounded-lg bg-hairline text-xs text-mist ring-1 ring-hairline sm:h-52 sm:w-35">
                No artwork
              </div>
            )}

            <div className="min-w-0 pt-16 sm:pt-22">
              <h3 className="font-display text-2xl font-bold leading-tight text-ink">
                {movie.title}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mist">
                {year && <span>{year}</span>}
                {runtime && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{runtime}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                    MOVIE_STATUS_STYLES[movie.status] ?? MOVIE_STATUS_FALLBACK
                  }`}
                >
                  {formatEnumLabel(movie.status)}
                </span>
              </div>

              {movie.genre?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-mist ring-1 ring-inset ring-hairline"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {cast.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-mist">
                Cast
              </h4>
              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {cast.map((c, i) => (
                  <div
                    key={`${c.name}-${i}`}
                    className="flex items-baseline justify-between gap-3 border-b border-hairline/60 py-1 text-sm last:border-0"
                  >
                    <span className="truncate font-medium text-ink">
                      {c.name}
                    </span>
                    <span className="shrink-0 truncate text-right text-mist">
                      {c.character || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={copyId}
              title="Copy catalog ID"
              className="flex items-center gap-2 font-mono text-xs text-mist transition-colors hover:text-velvet"
            >
              <span className="uppercase tracking-wide">Catalog&nbsp;ID</span>
              {movieId}
              <span className="rounded bg-paper px-1.5 py-0.5 text-[10px] uppercase tracking-wide ring-1 ring-inset ring-hairline">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
            <a
              href={tmdbMovieUrl(movie.tmdbId)}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-velvet hover:underline"
            >
              View on TMDB ↗
            </a>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
