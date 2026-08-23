import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import FormError from "../components/FormError";
import ScreensManager from "../components/ScreensManager";
import { LoadingBlock } from "../components/Spinner";
import { useAuth } from "../context/useAuth";
import { getMyTheaters } from "../api/theaters";
import { ApiError } from "../api/client";

/**
 * Owner dashboard: lists the theater(s) the logged-in Owner (or active
 * Staff member) manages, and lets them manage the selected theater's
 * Screens and seat maps via `ScreensManager`. Auto-selects when there's
 * exactly one theater (today's common case — Admin's create-owner flow
 * always creates exactly one theater per new owner).
 */
export default function OwnerDashboard() {
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

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper">
      <AppHeader />

      <div className="flex w-full flex-col items-center gap-6 px-6 py-8">
        {loading ? (
          <LoadingBlock label="Loading your theaters…" />
        ) : error ? (
          <div className="w-full max-w-5xl">
            <FormError message={error} />
          </div>
        ) : theaters.length === 0 ? (
          <p className="max-w-sm text-center text-mist">
            No theater is assigned to your account yet. Contact an admin if
            you believe this is a mistake.
          </p>
        ) : (
          <>
            {theaters.length > 1 && (
              <div className="flex w-full max-w-5xl flex-wrap gap-2">
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

            {selectedTheaterId && (
              <ScreensManager theaterId={selectedTheaterId} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
