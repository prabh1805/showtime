import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import FormError from "../components/FormError";
import { LoadingBlock } from "../components/Spinner";
import { useAuth } from "../context/useAuth";
import { getMyTheaters } from "../api/theaters";
import { ApiError } from "../api/client";
import { formatEnumLabel } from "../lib/format";
import { roleHomePath } from "../lib/roles";

const FIELDS = [
  { label: "First name", key: "firstName" },
  { label: "Last name", key: "lastName" },
  { label: "Email", key: "email" },
  { label: "Mobile number", key: "mobileNumber", fallback: "Not provided" },
];

/**
 * Read-only profile page, reachable by any authenticated role via the
 * ProfileMenu dropdown. Editing (backed by the existing
 * PATCH /api/v1/users/me endpoint) is a future follow-up. For OWNER/STAFF,
 * also surfaces the theater(s) tied to their account (via
 * `GET /api/v1/theaters/me`) with a link back to their dashboard, since
 * that context otherwise only lives on the dashboard itself.
 */
export default function Profile() {
  const auth = useAuth();
  const showsTheaters = auth.role === "OWNER" || auth.role === "STAFF";

  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(showsTheaters);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showsTheaters) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getMyTheaters(auth.accessToken);
        if (!cancelled) setTheaters(result);
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
  }, [showsTheaters, auth.accessToken]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper">
      <AppHeader />

      <div className="flex w-full flex-col items-center gap-6 px-6 py-8">
        <div className="w-full max-w-md">
          <Link
            to={roleHomePath(auth.role)}
            className="inline-block text-sm font-medium text-velvet hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
            Your profile
          </h1>
          <p className="mt-1 text-sm text-mist">
            Editing isn't available yet — this is a read-only view for now.
          </p>

          <dl className="mt-6 flex flex-col gap-4">
            {FIELDS.map(({ label, key, fallback }) => (
              <div key={key}>
                <dt className="text-xs uppercase tracking-wide text-mist">
                  {label}
                </dt>
                <dd className="mt-0.5 text-base text-ink">
                  {auth[key] || fallback || "—"}
                </dd>
              </div>
            ))}
            <div>
              <dt className="text-xs uppercase tracking-wide text-mist">
                Role
              </dt>
              <dd className="mt-0.5 text-base text-ink">
                {formatEnumLabel(auth.role)}
              </dd>
            </div>
          </dl>
        </div>

        {showsTheaters && (
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
            <h2 className="font-display text-lg font-bold tracking-wide text-ink">
              Your theater{theaters.length === 1 ? "" : "s"}
            </h2>

            {loading ? (
              <LoadingBlock label="Loading…" className="mt-4" />
            ) : error ? (
              <div className="mt-4">
                <FormError message={error} />
              </div>
            ) : theaters.length === 0 ? (
              <p className="mt-3 text-sm text-mist">
                No theater is assigned to your account yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {theaters.map((theater) => (
                  <li key={theater.id} className="rounded-md border border-hairline p-3">
                    <p className="font-medium text-ink">{theater.name}</p>
                    <p className="text-sm text-mist">
                      {theater.city}
                      {theater.address ? ` · ${theater.address}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
