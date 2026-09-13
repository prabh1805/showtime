import { useEffect, useState } from "react";
import FormField from "./FormField";
import FormError from "./FormError";
import Button from "./Button";
import { LoadingBlock } from "./Spinner";
import AddMoviesModal from "./AddMoviesModal";
import MovieHoverCard from "./MovieHoverCard";
import MovieDetailModal from "./MovieDetailModal";
import { getMoviesPage } from "../api/movies";
import { ApiError } from "../api/client";
import { formatEnumLabel } from "../lib/format";
import { formatRuntime } from "../lib/tmdb";
import { MOVIE_STATUS_STYLES, MOVIE_STATUS_FALLBACK } from "../lib/movieStatus";
import { useAuth } from "../context/useAuth";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const COLUMNS = [
  { field: "title", label: "Title" },
  { field: "duration", label: "Runtime" },
  { field: "releaseDate", label: "Released" },
  { field: "status", label: "Status" },
];

const EMPTY_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  first: true,
  last: true,
};

/** "2019-07-04" -> "4 Jul 2019"; falsy -> "—" */
function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Admin's persisted-movie catalog — GET /api/v1/movies/getPages. Owns its
 * own title filter (debounced), sort, and page state, re-fetching when any
 * of them change or after "Add movies" imports something. Hovering a row
 * shows a `MovieHoverCard` preview; clicking one opens `MovieDetailModal`
 * (full record, cast, artwork, and the catalog id).
 */
export default function MoviesPanel() {
  const { accessToken } = useAuth();
  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState({ field: "title", direction: "asc" });
  const [data, setData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [hover, setHover] = useState(null); // { movie, anchor } | null

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedTitle(titleFilter);
      setPage(0);
    }, 350);
    return () => clearTimeout(timeout);
  }, [titleFilter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getMoviesPage(
          {
            title: debouncedTitle,
            page,
            size: pageSize,
            sort: `${sort.field},${sort.direction}`,
          },
          accessToken,
        );
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load movies. Please try again.",
          );
          setData(EMPTY_PAGE);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedTitle, page, pageSize, sort, accessToken, refreshKey]);

  function toggleSort(field) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
    setPage(0);
  }

  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(0);
  }

  function openMovie(movieId) {
    setHover(null);
    setSelectedMovieId(movieId);
  }

  function handleRowEnter(movie, e) {
    const r = e.currentTarget.getBoundingClientRect();
    setHover({
      movie,
      anchor: { top: r.top, bottom: r.bottom, left: r.left, right: r.right },
    });
  }

  return (
    <section className="w-full max-w-5xl rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
            Movies
          </h2>
          <p className="mt-1 text-sm text-mist">
            {data.totalElements} movie{data.totalElements === 1 ? "" : "s"} in
            the catalog
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="sm:w-auto"
        >
          Add movies
        </Button>
      </div>

      <div className="mt-5">
        <FormField
          id="filter-movieTitle"
          label="Title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          placeholder="Search the catalog by title…"
        />
      </div>

      {error && (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-md border border-hairline">
        <table className="w-full min-w-160 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-mist">
              {COLUMNS.map((col) => {
                const isActive = sort.field === col.field;
                return (
                  <th key={col.field} className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.field)}
                      className={`flex items-center gap-1 transition-colors hover:text-velvet ${
                        isActive ? "text-velvet" : ""
                      }`}
                    >
                      {col.label}
                      <span aria-hidden="true" className="text-[10px]">
                        {isActive
                          ? sort.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "⇅"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-2">
                  <LoadingBlock label="Loading movies…" />
                </td>
              </tr>
            ) : data.content.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-10 text-center text-mist"
                >
                  {debouncedTitle
                    ? "No movies match that title."
                    : "No movies yet — use “Add movies” to import from TMDB."}
                </td>
              </tr>
            ) : (
              data.content.map((movie) => (
                <tr
                  key={movie.movieId}
                  onClick={() => openMovie(movie.movieId)}
                  onMouseEnter={(e) => handleRowEnter(movie, e)}
                  onMouseLeave={() =>
                    setHover((h) =>
                      h?.movie.movieId === movie.movieId ? null : h,
                    )
                  }
                  className="cursor-pointer border-b border-hairline transition-colors last:border-0 hover:bg-velvet/5"
                >
                  <td className="px-4 py-3 font-medium text-ink">
                    {movie.title}
                  </td>
                  <td className="px-4 py-3 text-mist">
                    {formatRuntime(movie.duration) || "—"}
                  </td>
                  <td className="px-4 py-3 text-mist">
                    {formatDate(movie.releaseDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        MOVIE_STATUS_STYLES[movie.status] ?? MOVIE_STATUS_FALLBACK
                      }`}
                    >
                      {formatEnumLabel(movie.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-mist">
            Page {data.totalPages === 0 ? 0 : data.number + 1} of{" "}
            {data.totalPages}
          </p>
          <label className="flex items-center gap-2 text-sm text-mist">
            Rows per page
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={loading}
              className="rounded-md border border-hairline bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-velvet-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={data.first || loading}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="rounded-md border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-velvet hover:text-velvet disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-ink"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={data.last || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-velvet hover:text-velvet disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hairline disabled:hover:text-ink"
          >
            Next
          </button>
        </div>
      </div>

      {hover && !loading && !selectedMovieId && (
        <MovieHoverCard movie={hover.movie} anchor={hover.anchor} />
      )}

      {isAddOpen && (
        <AddMoviesModal
          open
          onClose={() => setIsAddOpen(false)}
          onImported={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {selectedMovieId && (
        <MovieDetailModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </section>
  );
}
