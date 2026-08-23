import { useEffect, useMemo, useState } from "react";
import SeatGrid from "./SeatGrid";
import ScreenLayoutBuilder from "./ScreenLayoutBuilder";
import FormField from "./FormField";
import Button from "./Button";
import FormError from "./FormError";
import { LoadingBlock } from "./Spinner";
import { listSeatsByScreen, updateSeat, deleteSeat } from "../api/seats";
import { addSeatsToScreen, updateScreen, deleteScreen } from "../api/screens";
import { ApiError } from "../api/client";
import { useAuth } from "../context/useAuth";

const SCREEN_TYPES = ["REGULAR", "IMAX", "FOUR_DX", "DOLBY"];
const SCREEN_STATUSES = ["OPERATIONAL", "UNDER_MAINTENANCE", "PERMANENTLY_CLOSED"];

/**
 * Manage view for one screen: seat-map diagram (click a seat to mark it
 * broken/available or remove it), edit screen details, append more rows,
 * and delete the screen. Rendered inside a Modal by `ScreensManager`.
 *
 * @param {{ screen: object, onClose: () => void, onChanged: (updatedScreen?: object) => void }} props
 */
export default function ScreenDetail({ screen, onClose, onChanged }) {
  const { accessToken } = useAuth();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatActionPending, setSeatActionPending] = useState(false);
  const [seatActionError, setSeatActionError] = useState("");

  const [isEditingScreen, setIsEditingScreen] = useState(false);
  const [editFields, setEditFields] = useState({
    name: screen.name,
    type: screen.type,
    status: screen.status,
    bufferMinutes: screen.bufferMinutes,
  });
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState("");

  const [isAddingRows, setIsAddingRows] = useState(false);
  const [addRowsPending, setAddRowsPending] = useState(false);
  const [addRowsError, setAddRowsError] = useState("");

  const [deletePending, setDeletePending] = useState(false);

  /**
   * The screen's actual last saved row (alphabetically), split into its
   * real contiguous segments — NOT a naive min-to-max range, which would
   * silently treat any internal aisle gap as more seats. So "Add more rows"
   * can offer "same as previous row" starting from its very first new row
   * instead of only rows added after it in this session, without ever
   * fabricating seats that don't actually exist.
   */
  const lastExistingRow = useMemo(() => {
    const active = seats.filter((s) => s.status !== "REMOVED");
    if (active.length === 0) return null;

    const rowLetters = [...new Set(active.map((s) => s.row))].sort((a, b) =>
      a.localeCompare(b),
    );
    const lastRowLetter = rowLetters[rowLetters.length - 1];
    const rowSeats = active
      .filter((s) => s.row === lastRowLetter)
      .sort((a, b) => a.number - b.number);

    const segments = [];
    for (const seat of rowSeats) {
      const last = segments[segments.length - 1];
      if (
        last &&
        seat.number === last.startNumber + last.count &&
        seat.type === last.seatType
      ) {
        last.count += 1;
      } else {
        segments.push({
          seatType: seat.type,
          startNumber: seat.number,
          count: 1,
        });
      }
    }

    return { row: lastRowLetter, segments };
  }, [seats]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await listSeatsByScreen(screen.id, accessToken);
        if (!cancelled) setSeats(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.body?.message
              ? err.body.message
              : "Couldn't load seats.",
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
  }, [screen.id, accessToken, refreshKey]);

  function handleSeatClick(seat) {
    setSelectedSeat(seat);
    setSeatActionError("");
  }

  async function handleMarkStatus(status) {
    setSeatActionPending(true);
    setSeatActionError("");
    try {
      await updateSeat(selectedSeat.id, { status }, accessToken);
      setSelectedSeat(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setSeatActionError(
        err instanceof ApiError ? err.body?.message : "Something went wrong.",
      );
    } finally {
      setSeatActionPending(false);
    }
  }

  async function handleRemoveSeat() {
    setSeatActionPending(true);
    setSeatActionError("");
    try {
      await deleteSeat(selectedSeat.id, accessToken);
      setSelectedSeat(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setSeatActionError(
        err instanceof ApiError ? err.body?.message : "Something went wrong.",
      );
    } finally {
      setSeatActionPending(false);
    }
  }

  function toggleEdit() {
    if (!isEditingScreen) {
      setEditFields({
        name: screen.name,
        type: screen.type,
        status: screen.status,
        bufferMinutes: screen.bufferMinutes,
      });
      setEditError("");
    }
    setIsEditingScreen((v) => !v);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditPending(true);
    setEditError("");
    try {
      const updated = await updateScreen(
        screen.id,
        {
          name: editFields.name,
          type: editFields.type,
          status: editFields.status,
          bufferMinutes: Number(editFields.bufferMinutes),
        },
        accessToken,
      );
      setIsEditingScreen(false);
      onChanged(updated);
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.body?.message : "Something went wrong.",
      );
    } finally {
      setEditPending(false);
    }
  }

  async function handleAddRowsSubmit(rowSegmentRequests) {
    setAddRowsPending(true);
    setAddRowsError("");
    try {
      await addSeatsToScreen(screen.id, rowSegmentRequests, accessToken);
      setIsAddingRows(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setAddRowsError(
        err instanceof ApiError ? err.body?.message : "Something went wrong.",
      );
    } finally {
      setAddRowsPending(false);
    }
  }

  async function handleDeleteScreen() {
    if (!window.confirm(`Delete screen "${screen.name}"? This can't be undone.`)) {
      return;
    }
    setDeletePending(true);
    try {
      await deleteScreen(screen.id, accessToken);
      onChanged();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.body?.message : "Couldn't delete screen.",
      );
      setDeletePending(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      <FormError message={error} />

      {loading ? (
        <LoadingBlock label="Loading seats…" />
      ) : (
        <SeatGrid seats={seats} onSeatClick={handleSeatClick} />
      )}

      {selectedSeat && (
        <div className="rounded-md border border-hairline bg-paper p-4">
          <FormError message={seatActionError} />
          <p className="text-sm font-medium text-ink">
            Seat {selectedSeat.row}
            {selectedSeat.number}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSeat.status !== "AVAILABLE" && (
              <Button
                type="button"
                pending={seatActionPending}
                disabled={seatActionPending}
                onClick={() => handleMarkStatus("AVAILABLE")}
                className="bg-transparent! text-ink! ring-1 ring-inset ring-hairline hover:bg-surface!"
              >
                Mark available
              </Button>
            )}
            {selectedSeat.status !== "BROKEN" && (
              <Button
                type="button"
                pending={seatActionPending}
                disabled={seatActionPending}
                onClick={() => handleMarkStatus("BROKEN")}
                className="bg-transparent! text-ink! ring-1 ring-inset ring-hairline hover:bg-surface!"
              >
                Mark broken
              </Button>
            )}
            <Button
              type="button"
              pending={seatActionPending}
              disabled={seatActionPending}
              onClick={handleRemoveSeat}
              className="bg-transparent! text-velvet! ring-1 ring-inset ring-hairline hover:bg-surface!"
            >
              Remove seat
            </Button>
            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="px-3 py-2 text-sm text-mist hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 border-t border-hairline pt-4">
        <button
          type="button"
          onClick={toggleEdit}
          className="text-sm font-medium text-velvet hover:underline"
        >
          {isEditingScreen ? "Cancel edit" : "Edit screen"}
        </button>
        <button
          type="button"
          onClick={() => setIsAddingRows((v) => !v)}
          className="text-sm font-medium text-velvet hover:underline"
        >
          {isAddingRows ? "Cancel add rows" : "Add more rows"}
        </button>
        <button
          type="button"
          onClick={handleDeleteScreen}
          disabled={deletePending}
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {deletePending ? "Deleting…" : "Delete screen"}
        </button>
      </div>

      {isEditingScreen && (
        <form
          onSubmit={handleEditSubmit}
          className="flex flex-col gap-4 rounded-md border border-hairline p-4"
        >
          <FormError message={editError} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="edit-screen-name"
              label="Screen name"
              value={editFields.name}
              onChange={(e) =>
                setEditFields((p) => ({ ...p, name: e.target.value }))
              }
            />
            <FormField
              id="edit-screen-buffer"
              label="Buffer minutes"
              type="number"
              min="0"
              value={editFields.bufferMinutes}
              onChange={(e) =>
                setEditFields((p) => ({ ...p, bufferMinutes: e.target.value }))
              }
            />
            <div>
              <label
                htmlFor="edit-screen-type"
                className="mb-1.5 block text-base font-medium text-ink sm:text-lg"
              >
                Type
              </label>
              <select
                id="edit-screen-type"
                value={editFields.type}
                onChange={(e) =>
                  setEditFields((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full rounded-md border border-hairline bg-surface px-4 py-3 text-base text-ink focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
              >
                {SCREEN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-screen-status"
                className="mb-1.5 block text-base font-medium text-ink sm:text-lg"
              >
                Status
              </label>
              <select
                id="edit-screen-status"
                value={editFields.status}
                onChange={(e) =>
                  setEditFields((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full rounded-md border border-hairline bg-surface px-4 py-3 text-base text-ink focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
              >
                {SCREEN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button pending={editPending} disabled={editPending} className="sm:w-auto">
            Save changes
          </Button>
        </form>
      )}

      {isAddingRows && (
        <div className="rounded-md border border-hairline p-4">
          <ScreenLayoutBuilder
            onSubmit={handleAddRowsSubmit}
            submitLabel="Add rows"
            pending={addRowsPending}
            error={addRowsError}
            previousRow={lastExistingRow}
          />
        </div>
      )}
    </div>
  );
}
