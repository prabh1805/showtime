import { useEffect, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import FormField from "./FormField";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import ScreenLayoutBuilder from "./ScreenLayoutBuilder";
import ScreenDetail from "./ScreenDetail";
import { createScreen, listScreensByTheater } from "../api/screens";
import { ApiError } from "../api/client";
import { formatEnumLabel } from "../lib/format";
import { useAuth } from "../context/useAuth";

const SCREEN_TYPES = ["REGULAR", "IMAX", "FOUR_DX", "DOLBY"];
const EMPTY_SCREEN_FIELDS = { name: "", type: "REGULAR", bufferMinutes: 15 };

const STATUS_STYLES = {
  OPERATIONAL: "border-marquee/30 bg-marquee/10 text-marquee",
  UNDER_MAINTENANCE: "border-amber-200 bg-amber-50 text-amber-700",
  PERMANENTLY_CLOSED: "border-red-200 bg-red-50 text-red-700",
};

/**
 * Owns the screens list for a given theater: fetch/refresh, "Add screen"
 * (a Modal combining screen-level fields with `ScreenLayoutBuilder`'s
 * row-segment form + live diagram preview), and opening `ScreenDetail` to
 * manage an individual screen's seats.
 *
 * @param {{ theaterId: number }} props
 */
export default function ScreensManager({ theaterId }) {
  const { accessToken } = useAuth();
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [screenFields, setScreenFields] = useState(EMPTY_SCREEN_FIELDS);
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState("");

  const [selectedScreen, setSelectedScreen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const page = await listScreensByTheater(
          theaterId,
          { size: 100 },
          accessToken,
        );
        if (!cancelled) setScreens(page.content);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load screens.",
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

  function openCreate() {
    setScreenFields(EMPTY_SCREEN_FIELDS);
    setCreateError("");
    setIsCreateOpen(true);
  }
  function closeCreate() {
    if (createPending) return;
    setIsCreateOpen(false);
  }

  async function handleCreateSubmit(rowSegmentRequests) {
    if (!screenFields.name.trim()) {
      setCreateError("Screen name is required.");
      return;
    }
    setCreateError("");
    setCreatePending(true);
    try {
      await createScreen(
        {
          theaterId,
          name: screenFields.name,
          type: screenFields.type,
          bufferMinutes: Number(screenFields.bufferMinutes),
          rowSegmentRequests,
        },
        accessToken,
      );
      setIsCreateOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.body?.message : "Something went wrong.",
      );
    } finally {
      setCreatePending(false);
    }
  }

  function handleScreenChanged(updatedScreen) {
    setRefreshKey((k) => k + 1);
    if (updatedScreen) setSelectedScreen(updatedScreen);
  }

  return (
    <section className="w-full max-w-5xl rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
          Screens
        </h2>
        <Button type="button" onClick={openCreate} className="sm:w-auto">
          Add screen
        </Button>
      </div>

      {error && (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading screens…" className="mt-6" />
      ) : screens.length === 0 ? (
        <p className="mt-6 text-center text-mist">
          No screens yet — add your first one.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {screens.map((screen) => (
            <div key={screen.id} className="rounded-lg border border-hairline p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{screen.name}</p>
                  <p className="text-xs text-mist">
                    {formatEnumLabel(screen.type)} · {screen.bufferMinutes} min
                    buffer
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[screen.status] ?? "border-hairline text-mist"
                  }`}
                >
                  {formatEnumLabel(screen.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScreen(screen)}
                className="mt-3 text-sm font-medium text-velvet hover:underline"
              >
                Manage seats
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={isCreateOpen}
        onClose={closeCreate}
        title="Add screen"
        closeDisabled={createPending}
        maxWidthClassName="max-w-4xl"
      >
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            id="screen-name"
            label="Screen name"
            value={screenFields.name}
            onChange={(e) =>
              setScreenFields((p) => ({ ...p, name: e.target.value }))
            }
          />
          <div>
            <label
              htmlFor="screen-type"
              className="mb-1.5 block text-base font-medium text-ink sm:text-lg"
            >
              Type
            </label>
            <select
              id="screen-type"
              value={screenFields.type}
              onChange={(e) =>
                setScreenFields((p) => ({ ...p, type: e.target.value }))
              }
              className="w-full rounded-md border border-hairline bg-surface px-4 py-3 text-base text-ink focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
            >
              {SCREEN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {formatEnumLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <FormField
            id="screen-buffer"
            label="Buffer minutes"
            type="number"
            min="0"
            value={screenFields.bufferMinutes}
            onChange={(e) =>
              setScreenFields((p) => ({ ...p, bufferMinutes: e.target.value }))
            }
          />
        </div>

        <div className="mt-6">
          <ScreenLayoutBuilder
            onSubmit={handleCreateSubmit}
            submitLabel="Create screen"
            pending={createPending}
            error={createError}
          />
        </div>
      </Modal>

      {selectedScreen && (
        <Modal
          open
          onClose={() => setSelectedScreen(null)}
          title={selectedScreen.name}
          maxWidthClassName="max-w-5xl"
        >
          <ScreenDetail
            screen={selectedScreen}
            onClose={() => setSelectedScreen(null)}
            onChanged={handleScreenChanged}
          />
        </Modal>
      )}
    </section>
  );
}
