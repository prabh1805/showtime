import { lazy, Suspense, useState } from "react";
import AppHeader from "../components/AppHeader";
import Button from "../components/Button";
import AddStaffModal from "../components/AddStaffModal";
import TheaterScreensView from "../components/TheaterScreensView";
import { LoadingBlock } from "../components/Spinner";

// Lazy: pulls in Recharts, which only Owners viewing analytics ever need —
// keeps that weight out of every other role's bundle.
const AnalyticsPanel = lazy(() => import("../components/AnalyticsPanel"));

/**
 * Owner dashboard: theater(s) the logged-in Owner manages
 * (`TheaterScreensView`, shared with `StaffDashboard`), plus Owner-only
 * actions for whichever theater is currently selected — "Add staff" and
 * revenue/shows `AnalyticsPanel`.
 */
export default function OwnerDashboard() {
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper">
      <AppHeader />

      <div className="flex w-full flex-col items-center gap-6 px-6 py-8">
        <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
              Owner dashboard
            </h1>
            <p className="mt-1 text-sm text-mist">
              Manage your theater's screens, seats, staff, and shows.
            </p>
          </div>
          {selectedTheater && (
            <Button
              type="button"
              onClick={() => setIsAddStaffOpen(true)}
              className="w-auto px-4 py-2 text-sm sm:px-4 sm:py-2 sm:text-sm"
            >
              Add staff
            </Button>
          )}
        </div>

        {selectedTheater && (
          <Suspense fallback={<LoadingBlock label="Loading analytics…" />}>
            <AnalyticsPanel theaterId={selectedTheater.id} />
          </Suspense>
        )}

        <TheaterScreensView onTheaterChange={setSelectedTheater} />
      </div>

      {selectedTheater && (
        <AddStaffModal
          theaterId={selectedTheater.id}
          open={isAddStaffOpen}
          onClose={() => setIsAddStaffOpen(false)}
        />
      )}
    </main>
  );
}
