import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/useAuth";
import { formatEnumLabel } from "../lib/format";

const FIELDS = [
  { label: "First name", key: "firstName" },
  { label: "Last name", key: "lastName" },
  { label: "Email", key: "email" },
  { label: "Mobile number", key: "mobileNumber", fallback: "Not provided" },
];

/**
 * Read-only profile page, reachable by any authenticated role via the
 * ProfileMenu dropdown. Editing (backed by the existing
 * PATCH /api/v1/users/me endpoint) is a future follow-up — this just
 * surfaces what AuthContext already loaded after login/session-restore.
 */
export default function Profile() {
  const auth = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper">
      <AppHeader />

      <div className="flex w-full flex-col items-center gap-6 px-6 py-8">
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
      </div>
    </main>
  );
}
