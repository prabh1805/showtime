import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import { searchTmdbMovies, upsertMovies } from "../api/movies";
import { ApiError } from "../api/client";
import { tmdbImage, releaseYear } from "../lib/tmdb";
import { useAuth } from "../context/useAuth";

/**
 * Admin "add movies to the catalog" flow, end to end:
 *  1. search TMDB by title (GET /api/v1/movies/tmdbSearch)
 *  2. tick one or more results
 *  3. import them (POST /api/v1/movies/upsertMovies), which persists each
 *     and returns its catalog `movieId`
 *  4. show the per-movie outcome; `onImported` lets the parent refresh its
 *     catalog list.
 *
 * Mount this only while the dialog should be open (the parent gates it with
 * `{isAddOpen && <AddMoviesModal .../>}`) so every open starts from fresh
 * `useState` defaults — no reset effect needed.
 *
 * @param {Object} props
 * @param {boolean} props.open - passed straight to the inner Modal.
 * @param {() => void} props.onClose
 * @param {(results: Array<{ tmdbId: number, movieId?: string, title?: string, reason?: string }>) => void} props.onImported
 *   - called after a successful import call (even if some items failed).
 */
export default function AddMoviesModal({ open, onClose, onImported }) {
  const { accessToken } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState("idle"); // idle | loading | done | error
  const [searchError, setSearchError] = useState("");

  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importResults, setImportResults] = useState(null); // Array | null

  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchState("loading");
    setSearchError("");
    setImportResults(null);
    try {
      const data = await searchTmdbMovies(q, accessToken);
      setResults(data?.results ?? []);
      setSearchState("done");
    } catch (err) {
      setResults([]);
      setSearchState("error");
      setSearchError(
        err instanceof ApiError
          ? err.status === 502
            ? "TMDB is unreachable right now. Try again in a moment."
            : err.body?.message || "Search failed."
          : "Search failed.",
      );
    }
  }

  function toggleSelected(tmdbId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tmdbId)) next.delete(tmdbId);
      else next.add(tmdbId);
      return next;
    });
  }

  async function handleImport() {
    if (selectedIds.size === 0) return;
    setImporting(true);
    setImportError("");
    setImportResults(null);
    try {
      const res = await upsertMovies([...selectedIds], accessToken);
      setImportResults(res);
      onImported?.(res);
      // Drop successfully-imported rows from the selection so a retry only
      // re-sends the ones that failed.
      const succeeded = new Set(
        res.filter((r) => r.movieId).map((r) => r.tmdbId),
      );
      setSelectedIds((prev) => new Set([...prev].filter((id) => !succeeded.has(id))));
    } catch (err) {
      setImportError(
        err instanceof ApiError
          ? err.body?.message || "Import failed."
          : "Import failed.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add movies"
      closeDisabled={importing}
      maxWidthClassName="max-w-3xl"
    >
      <p className="mt-1 text-sm text-mist">
        Search TMDB by title, pick the ones you want, and import them into
        the catalog.
      </p>

      <form onSubmit={handleSearch} className="mt-5 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Interstellar"
          autoFocus
          className="w-full rounded-md border border-hairline bg-surface px-4 py-3 text-base text-ink placeholder:text-mist focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
        />
        <Button
          type="submit"
          pending={searchState === "loading"}
          pendingLabel="Searching…"
          disabled={searchState === "loading" || !query.trim()}
          className="sm:w-auto"
        >
          Search
        </Button>
      </form>

      {searchState === "loading" && (
        <LoadingBlock label="Searching TMDB…" className="mt-6" />
      )}

      {searchState === "error" && (
        <div className="mt-4">
          <FormError message={searchError} />
        </div>
      )}

      {searchState === "done" && results.length === 0 && (
        <p className="mt-6 text-center text-mist">
          No matches on TMDB for “{query.trim()}”.
        </p>
      )}

      {searchState !== "loading" && results.length > 0 && (
        <ul
          className={`mt-4 max-h-[45vh] divide-y divide-hairline overflow-y-auto rounded-md border border-hairline transition-opacity ${
            importing ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {results.map((movie) => {
            const checked = selectedIds.has(movie.id);
            return (
              <li key={movie.id}>
                <label className="flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-paper/60">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelected(movie.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-velvet"
                  />
                  {movie.posterPath ? (
                    <img
                      src={tmdbImage(movie.posterPath, "w92")}
                      alt=""
                      className="h-18 w-12 shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-18 w-12 shrink-0 items-center justify-center rounded bg-hairline text-[10px] text-mist">
                      No art
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {movie.title}
                      {releaseYear(movie.releaseDate) && (
                        <span className="font-normal text-mist">
                          {" "}
                          ({releaseYear(movie.releaseDate)})
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-xs text-mist">
                      TMDB {movie.id}
                    </p>
                    {movie.overview && (
                      <p className="mt-1 line-clamp-2 text-sm text-mist">
                        {movie.overview}
                      </p>
                    )}
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {importing && (
        <LoadingBlock
          label={`Importing ${selectedIds.size} movie${
            selectedIds.size === 1 ? "" : "s"
          } from TMDB…`}
          className="mt-4"
        />
      )}

      {importResults && (
        <div className="mt-4 rounded-md border border-hairline bg-paper/50 p-3">
          <p className="text-sm font-medium text-ink">
            Imported {importResults.filter((r) => r.movieId).length} of{" "}
            {importResults.length}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {importResults.map((r) => (
              <li key={r.tmdbId} className="flex gap-2">
                {r.movieId ? (
                  <>
                    <span className="text-marquee">✓</span>
                    <span className="text-ink">
                      {r.title}{" "}
                      <span className="font-mono text-xs text-mist">
                        {r.movieId}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-red-600">✕</span>
                    <span className="text-mist">
                      TMDB {r.tmdbId} — {r.reason}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {importError && (
        <div className="mt-4">
          <FormError message={importError} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
        <Button
          type="button"
          onClick={handleImport}
          pending={importing}
          pendingLabel="Importing…"
          disabled={importing || selectedIds.size === 0}
          className="w-full sm:w-auto"
        >
          {selectedIds.size > 0
            ? `Import ${selectedIds.size} movie${selectedIds.size === 1 ? "" : "s"}`
            : "Import"}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          disabled={importing}
          className="w-full bg-transparent! text-ink! ring-1 ring-inset ring-hairline hover:bg-paper! sm:w-auto"
        >
          {importResults ? "Done" : "Cancel"}
        </Button>
      </div>

    </Modal>
  );
}
