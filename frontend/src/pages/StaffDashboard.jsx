import AppHeader from "../components/AppHeader";
import TheaterScreensView from "../components/TheaterScreensView";

/**
 * Staff dashboard: the theater(s) this staff member actively works at, with
 * the same screens/seats/shows management as `OwnerDashboard` — the
 * backend's `assertCallerCanManage` already grants active STAFF the same
 * access as the OWNER. No staff-registration action here (Owner-only).
 */
export default function StaffDashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-paper">
      <AppHeader />

      <div className="flex w-full flex-col items-center gap-6 px-6 py-8">
        <div className="w-full max-w-5xl">
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
            Staff dashboard
          </h1>
          <p className="mt-1 text-sm text-mist">
            Manage screens, seats, and shows for the theater you work at.
          </p>
        </div>

        <TheaterScreensView />
      </div>
    </main>
  );
}
