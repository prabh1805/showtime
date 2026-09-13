import { formatEnumLabel } from "../lib/format";
import { tmdbImage, formatRuntime, releaseYear } from "../lib/tmdb";
import { MOVIE_STATUS_STYLES, MOVIE_STATUS_FALLBACK } from "../lib/movieStatus";

const CARD_W = 320;
const CARD_H = 220;
const GAP = 14;
const EDGE = 10;

/**
 * Floating preview shown while a movie row is hovered — a mini poster plus
 * the quick facts, positioned next to the row and clamped inside the
 * viewport. Purely presentational and `pointer-events-none`, so it never
 * intercepts the click that opens the full detail view.
 *
 * @param {Object} props
 * @param {{ title: string, status: string, releaseDate: string|null, duration: number, genre: string[], posterPath: string|null }} props.movie
 * @param {{ top: number, bottom: number, left: number, right: number }} props.anchor
 *   - the hovered row's bounding rect (viewport coords).
 */
export default function MovieHoverCard({ movie, anchor }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchor.right + GAP;
  if (left + CARD_W > vw - EDGE) left = anchor.left - CARD_W - GAP;
  if (left < EDGE) left = Math.max(EDGE, vw - CARD_W - EDGE);

  let top = anchor.top - 8;
  if (top + CARD_H > vh - EDGE) top = vh - CARD_H - EDGE;
  if (top < EDGE) top = EDGE;

  const poster = tmdbImage(movie.posterPath, "w185");
  const year = releaseYear(movie.releaseDate);
  const runtime = formatRuntime(movie.duration);

  return (
    <div
      style={{ left, top, width: CARD_W }}
      className="pointer-events-none fixed z-[60] overflow-hidden rounded-xl border border-hairline bg-linear-to-br from-surface to-paper shadow-xl"
    >
      <div className="h-1 w-full bg-velvet" />
      <div className="flex gap-3 p-3">
        {poster ? (
          <img
            src={poster}
            alt=""
            className="h-40 w-27 shrink-0 rounded-lg object-cover ring-1 ring-hairline"
          />
        ) : (
          <div className="flex h-40 w-27 shrink-0 items-center justify-center rounded-lg bg-hairline text-[10px] text-mist ring-1 ring-hairline">
            No artwork
          </div>
        )}

        <div className="flex min-w-0 flex-col">
          <p className="font-display text-base font-bold leading-tight text-ink">
            {movie.title}
          </p>
          <p className="mt-1 text-xs text-mist">
            {[year, runtime].filter(Boolean).join(" · ") || "—"}
          </p>

          <span
            className={`mt-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              MOVIE_STATUS_STYLES[movie.status] ?? MOVIE_STATUS_FALLBACK
            }`}
          >
            {formatEnumLabel(movie.status)}
          </span>

          {movie.genre?.length > 0 && (
            <p className="mt-2 line-clamp-2 text-xs text-mist">
              {movie.genre.slice(0, 3).join(" • ")}
            </p>
          )}

          <p className="mt-auto pt-3 text-[10px] font-semibold uppercase tracking-wide text-velvet">
            Click for full details
          </p>
        </div>
      </div>
    </div>
  );
}
