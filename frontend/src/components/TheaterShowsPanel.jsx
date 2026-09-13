import { useEffect, useState } from "react";
import Button from "./Button";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import CreateShowModal from "./CreateShowModal";
import { listShowsByTheater } from "../api/shows";
import { ApiError } from "../api/client";
import { useAuth } from "../context/useAuth";
import { formatEnumLabel } from "../lib/format";

const STATUS_STYLES = {
  SCHEDULED: "border-marquee/30 bg-marquee/10 text-marquee",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

/** "2026-01-01T19:45:00" -> "1 Jan 2026, 7:45 pm" */
function formatShowTime(isoDateTime) {
  return new Date(isoDateTime).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * A theater's scheduled shows across all of its screens, with a direct
 * "Schedule a show" button — the screen is picked as part of the form
 * itself (`CreateShowModal`), so this doesn't require drilling into a
 * specific screen first. Sibling to `ScreensManager` on the Owner/Staff
 * dashboard (via `TheaterScreensView`).
 *
 * @param {{ theaterId: number }} props
 */
export default function TheaterShowsPanel({ theaterId }) {
  const { accessToken } = useAuth();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await listShowsByTheater(theaterId, accessToken);
        if (!cancelled) setShows(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load shows.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [theaterId, accessToken, refreshKey]);

  return (
    <section className="w-full max-w-5xl rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
          Shows
        </h2>
        <Button type="button" onClick={() => setIsCreateOpen(true)} className="sm:w-auto">
          Schedule a show
        </Button>
      </div>

      {error && (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading shows…" className="mt-6" />
      ) : shows.length === 0 ? (
        <p className="mt-6 text-center text-mist">
          No shows scheduled yet — schedule your first one.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {shows.map((show) => (
            <li
              key={show.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-hairline px-3 py-2"
            >
              <div>
                <p className="font-medium text-ink">{show.movieName}</p>
                <p className="font-mono text-xs text-mist">
                  #{show.id} · {show.screenName} · {formatShowTime(show.showTime)} ·{" "}
                  {formatEnumLabel(show.format)} · {show.language}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  STATUS_STYLES[show.status] ?? "border-hairline text-mist"
                }`}
              >
                {formatEnumLabel(show.status)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <CreateShowModal
        theaterId={theaterId}
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </section>
  );
}
