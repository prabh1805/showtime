import { useEffect, useState } from "react";
import FormError from "./FormError";
import ScreensManager from "./ScreensManager";
import TheaterShowsPanel from "./TheaterShowsPanel";
import { LoadingBlock } from "./Spinner";
import { useAuth } from "../context/useAuth";
import { getMyTheaters } from "../api/theaters";
import { ApiError } from "../api/client";

/**
 * Loads the theater(s) the logged-in Owner (or active Staff member) manages
 * and renders `ScreensManager` for the selected one. Auto-selects when
 * there's exactly one theater. Shared by `OwnerDashboard` and
 * `StaffDashboard` — the backend's `assertCallerCanManage` already grants
 * both roles the same screen/seat/show access for their theater(s).
 *
 * @param {{ onTheaterChange?: (theater: object | null) => void }} [props]
 *   Called whenever the selected theater changes (including on initial
 *   load), so a parent page can render theater-scoped actions of its own
 *   (e.g. Owner's "Add staff" button) without re-fetching theaters itself.
 */
export default function TheaterScreensView({ onTheaterChange }) {
  const auth = useAuth();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getMyTheaters(auth.accessToken);
        if (!cancelled) {
          setTheaters(result);
          if (result.length > 0) setSelectedTheaterId(result[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load your theaters.",
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
  }, [auth.accessToken]);

  useEffect(() => {
    onTheaterChange?.(theaters.find((t) => t.id === selectedTheaterId) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTheaterId, theaters]);

  if (loading) return <LoadingBlock label="Loading your theaters…" />;
  if (error) {
    return (
      <div className="w-full max-w-5xl">
        <FormError message={error} />
      </div>
    );
  }
  if (theaters.length === 0) {
    return (
      <p className="max-w-sm text-center text-mist">
        No theater is assigned to your account yet. Contact an admin if you
        believe this is a mistake.
      </p>
    );
  }

  const selectedTheater = theaters.find((t) => t.id === selectedTheaterId);

  return (
    <>
      <div className="flex w-full max-w-5xl flex-col gap-3">
        {selectedTheater && (
          <h2 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
            {selectedTheater.name}
            <span className="font-sans text-base font-normal text-mist">
              {" "}
              · {selectedTheater.city}
            </span>
          </h2>
        )}

        {theaters.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {theaters.map((theater) => (
              <button
                key={theater.id}
                type="button"
                onClick={() => setSelectedTheaterId(theater.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  theater.id === selectedTheaterId
                    ? "border-velvet bg-velvet text-paper"
                    : "border-hairline text-ink hover:border-velvet hover:text-velvet"
                }`}
              >
                {theater.name} · {theater.city}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTheaterId && <TheaterShowsPanel theaterId={selectedTheaterId} />}
      {selectedTheaterId && <ScreensManager theaterId={selectedTheaterId} />}
    </>
  );
}
