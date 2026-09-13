import { useEffect, useState } from "react";
import Modal from "./Modal";
import FormField from "./FormField";
import Button from "./Button";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import { getMoviesForStaff } from "../api/movies";
import { createShow } from "../api/shows";
import { listScreensByTheater } from "../api/screens";
import { ApiError } from "../api/client";
import { useAuth } from "../context/useAuth";
import { formatEnumLabel } from "../lib/format";
import { tmdbImage, releaseYear } from "../lib/tmdb";
import { mapFieldErrors } from "../lib/validators";

const SHOW_FORMATS = ["TWO_D", "THREE_D", "IMAX_2D", "IMAX_3D", "FOUR_DX"];
const SEAT_TYPES = ["REGULAR", "PREMIUM", "RECLINER"];

const EMPTY_FIELDS = {
  screenId: "",
  showTime: "",
  language: "English",
  format: "TWO_D",
  prices: { REGULAR: "", PREMIUM: "", RECLINER: "" },
};

/**
 * Converts a `datetime-local` input value ("YYYY-MM-DDTHH:mm") into the
 * `LocalDateTime` string shape the backend expects ("YYYY-MM-DDTHH:mm:ss").
 *
 * @param {string} value
 * @returns {string}
 */
function toLocalDateTimeString(value) {
  return value.length === 16 ? `${value}:00` : value;
}

/**
 * "Schedule a show" form for a theater: pick a screen, a movie (debounced
 * search over the SCHEDULABLE catalog), a start time, language, format, and
 * a price per seat category. Mirrors `AddMoviesModal`'s search-and-pick
 * list and `ScreensManager`'s create-then-close-and-refresh flow.
 *
 * @param {{ theaterId: number, open: boolean, onClose: () => void, onCreated: (show: object) => void }} props
 */
export default function CreateShowModal({ theaterId, open, onClose, onCreated }) {
  const { accessToken } = useAuth();
  const [screens, setScreens] = useState([]);
  const [screensLoading, setScreensLoading] = useState(true);
  const [screensError, setScreensError] = useState("");

  const [titleFilter, setTitleFilter] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [movies, setMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setScreensLoading(true);
      setScreensError("");
      try {
        const page = await listScreensByTheater(theaterId, { size: 100 }, accessToken);
        if (!cancelled) setScreens(page.content);
      } catch (err) {
        if (!cancelled) {
          setScreensError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load screens.",
          );
        }
      } finally {
        if (!cancelled) setScreensLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, theaterId, accessToken]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTitle(titleFilter), 350);
    return () => clearTimeout(timeout);
  }, [titleFilter]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setMoviesLoading(true);
      setMoviesError("");
      try {
        const result = await getMoviesForStaff(
          { title: debouncedTitle, status: ["SCHEDULABLE"] },
          accessToken,
        );
        if (!cancelled) setMovies(result);
      } catch (err) {
        if (!cancelled) {
          setMoviesError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load movies.",
          );
        }
      } finally {
        if (!cancelled) setMoviesLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, debouncedTitle, accessToken]);

  function handleClose() {
    if (pending) return;
    setTitleFilter("");
    setDebouncedTitle("");
    setSelectedMovie(null);
    setFields(EMPTY_FIELDS);
    setErrors({});
    setFormError("");
    onClose();
  }

  function validate() {
    const errorsObj = {};
    if (!fields.screenId) errorsObj.screenId = "Pick a screen.";
    if (!selectedMovie) errorsObj.movieId = "Pick a movie.";
    if (!fields.showTime) errorsObj.showTime = "Show time is required.";
    if (!fields.language.trim()) errorsObj.language = "Language is required.";
    for (const type of SEAT_TYPES) {
      const price = fields.prices[type];
      if (!price || Number(price) <= 0) {
        errorsObj.categoryPricing = "Enter a price for every seat category.";
        break;
      }
    }
    setErrors(errorsObj);
    return Object.keys(errorsObj).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setPending(true);
    try {
      const show = await createShow(
        {
          movieId: selectedMovie.movieId,
          screenId: Number(fields.screenId),
          showTime: toLocalDateTimeString(fields.showTime),
          language: fields.language.trim(),
          format: fields.format,
          categoryPricing: {
            REGULAR: Number(fields.prices.REGULAR),
            PREMIUM: Number(fields.prices.PREMIUM),
            RECLINER: Number(fields.prices.RECLINER),
          },
        },
        accessToken,
      );
      onCreated(show);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setErrors(mapFieldErrors(err.body?.fieldErrors));
      } else {
        setFormError(
          err instanceof ApiError ? err.body?.message : "Something went wrong.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Schedule a show"
      closeDisabled={pending}
      maxWidthClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-5">
        <FormError message={formError} />

        <div>
          <label
            htmlFor="show-screen"
            className="mb-1.5 block text-base font-medium text-ink sm:text-lg"
          >
            Screen
          </label>
          {screensLoading ? (
            <LoadingBlock label="Loading screens…" className="py-2" />
          ) : screensError ? (
            <p className="text-sm text-red-600">{screensError}</p>
          ) : (
            <select
              id="show-screen"
              value={fields.screenId}
              onChange={(e) =>
                setFields((p) => ({ ...p, screenId: e.target.value }))
              }
              className="w-full rounded-md border border-hairline bg-surface px-4 py-3 text-base text-ink focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
            >
              <option value="" disabled>
                Select a screen…
              </option>
              {screens.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.name} ({formatEnumLabel(screen.type)})
                </option>
              ))}
            </select>
          )}
          {errors.screenId && (
            <p className="mt-1.5 text-sm text-red-600">{errors.screenId}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-base font-medium text-ink sm:text-lg">
            Movie
          </label>
          {selectedMovie ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-velvet bg-velvet/5 px-4 py-3">
              <span className="text-base text-ink">
                {selectedMovie.title}
                {releaseYear(selectedMovie.releaseDate) && (
                  <span className="text-mist"> ({releaseYear(selectedMovie.releaseDate)})</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setSelectedMovie(null)}
                className="text-sm font-medium text-velvet hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Search movies…"
                className="w-full rounded-md border border-hairline bg-surface px-4 py-3 text-base text-ink placeholder:text-mist focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
              />
              <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-hairline">
                {moviesLoading ? (
                  <LoadingBlock label="Searching…" className="py-4" />
                ) : moviesError ? (
                  <p className="p-4 text-sm text-red-600">{moviesError}</p>
                ) : movies.length === 0 ? (
                  <p className="p-4 text-center text-sm text-mist">No movies found.</p>
                ) : (
                  movies.map((movie) => (
                    <button
                      key={movie.movieId}
                      type="button"
                      onClick={() => setSelectedMovie(movie)}
                      className="flex w-full items-center gap-3 border-b border-hairline px-3 py-2 text-left last:border-b-0 hover:bg-paper"
                    >
                      {tmdbImage(movie.posterPath, "w92") ? (
                        <img
                          src={tmdbImage(movie.posterPath, "w92")}
                          alt=""
                          className="h-12 w-8 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <span className="h-12 w-8 shrink-0 rounded bg-hairline/40" />
                      )}
                      <span className="text-sm text-ink">
                        {movie.title}
                        {releaseYear(movie.releaseDate) && (
                          <span className="text-mist"> ({releaseYear(movie.releaseDate)})</span>
                        )}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
          {errors.movieId && (
            <p className="mt-1.5 text-sm text-red-600">{errors.movieId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="show-time"
            label="Show time"
            type="datetime-local"
            value={fields.showTime}
            onChange={(e) =>
              setFields((p) => ({ ...p, showTime: e.target.value }))
            }
            error={errors.showTime}
          />
          <FormField
            id="show-language"
            label="Language"
            value={fields.language}
            onChange={(e) =>
              setFields((p) => ({ ...p, language: e.target.value }))
            }
            error={errors.language}
          />
        </div>

        <div>
          <label
            htmlFor="show-format"
            className="mb-1.5 block text-base font-medium text-ink sm:text-lg"
          >
            Format
          </label>
          <select
            id="show-format"
            value={fields.format}
            onChange={(e) => setFields((p) => ({ ...p, format: e.target.value }))}
            className="w-full rounded-md border border-hairline bg-surface px-4 py-3 text-base text-ink focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
          >
            {SHOW_FORMATS.map((f) => (
              <option key={f} value={f}>
                {formatEnumLabel(f)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-base font-medium text-ink sm:text-lg">
            Ticket price by seat category
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SEAT_TYPES.map((type) => (
              <FormField
                key={type}
                id={`show-price-${type}`}
                label={formatEnumLabel(type)}
                type="number"
                min="1"
                step="0.01"
                value={fields.prices[type]}
                onChange={(e) =>
                  setFields((p) => ({
                    ...p,
                    prices: { ...p.prices, [type]: e.target.value },
                  }))
                }
              />
            ))}
          </div>
          {errors.categoryPricing && (
            <p className="mt-1.5 text-sm text-red-600">{errors.categoryPricing}</p>
          )}
        </div>

        <Button pending={pending} disabled={pending} className="w-full">
          Schedule show
        </Button>
      </form>
    </Modal>
  );
}
