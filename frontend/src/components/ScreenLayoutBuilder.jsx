import { useMemo, useState } from "react";
import FormField from "./FormField";
import Button from "./Button";
import FormError from "./FormError";
import SeatGrid from "./SeatGrid";

const SEAT_TYPES = ["REGULAR", "PREMIUM", "RECLINER"];

/** "REGULAR" -> "Regular" */
function formatSeatType(type) {
  return type[0] + type.slice(1).toLowerCase();
}

let nextRowId = 0;

function blankRow() {
  return {
    id: `row-${nextRowId++}`,
    row: "",
    seatType: "REGULAR",
    startNumber: 1,
    count: 10,
    sameAsPrevious: false,
  };
}

/** "A" -> "B", "Z" -> "AA", "AZ" -> "BA" — spreadsheet-style; "" or invalid input -> "". */
function nextRowLetter(row) {
  if (!/^[A-Z]{1,3}$/.test(row)) return "";
  const chars = row.split("");
  let i = chars.length - 1;
  while (i >= 0 && chars[i] === "Z") {
    chars[i] = "A";
    i--;
  }
  if (i < 0) {
    chars.unshift("A");
  } else {
    chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
  }
  const result = chars.join("");
  return result.length <= 3 ? result : "";
}

/**
 * Repeatable row-segment builder (row letter, plus either a "same seat
 * numbers as the row above" checkbox or a full seat type/start/count form)
 * with a live `SeatGrid` preview below it. Generic — used both for a
 * brand-new screen's initial layout and for appending more rows to an
 * existing screen; the caller supplies `onSubmit` and decides what to do
 * with the resulting row segments (create vs. append). Server-side
 * overlap/duplicate conflicts are the caller's responsibility to surface via
 * the `error` prop — this component does no overlap validation of its own.
 *
 * A "row" can resolve to MULTIPLE row-segments (e.g. seats 1-5, gap, 7-11 —
 * a real row with an aisle) — "same as previous row" copies that exact
 * segment structure, not just a single min-to-max range, so it doesn't
 * silently fill in gaps that were meant to stay empty.
 *
 * @param {{ onSubmit: (rowSegments: Array<{row: string, seatType: string, startNumber: number, count: number}>) => void, submitLabel: string, pending?: boolean, error?: string, previousRow?: {row: string, segments: Array<{seatType: string, startNumber: number, count: number}>} }} props
 * @param {object} [props.previousRow] - the screen's actual last saved row,
 *   already split into its real contiguous segments (when appending to an
 *   existing screen), so the very first draft row can also offer "same as
 *   previous row" instead of only rows added after it within this session.
 */
export default function ScreenLayoutBuilder({
  onSubmit,
  submitLabel,
  pending = false,
  error = "",
  previousRow = null,
}) {
  const [draftRows, setDraftRows] = useState(() => {
    const first = blankRow();
    if (previousRow) {
      first.row = nextRowLetter(previousRow.row);
      first.sameAsPrevious = true;
    }
    return [first];
  });

  function updateRow(id, field, value) {
    setDraftRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  /** Appends a new row, defaulting to "same seat numbers as the previous row" (the common case) with the row letter advanced. */
  function addRow() {
    setDraftRows((prev) => {
      const last = prev[prev.length - 1];
      const next = blankRow();
      if (last) {
        next.row = nextRowLetter(last.row);
        next.sameAsPrevious = true;
      }
      return [...prev, next];
    });
  }

  function toggleSameAsPrevious(id) {
    setDraftRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, sameAsPrevious: !r.sameAsPrevious } : r,
      ),
    );
  }

  function removeDraftRow(id) {
    setDraftRows((prev) => prev.filter((r) => r.id !== id));
  }

  /**
   * draftRows resolved to `{ row, segments }`, where `segments` is the real
   * array of contiguous runs that row will submit as. A manually-filled row
   * always has exactly one segment (start+count). A "same as previous" row
   * copies its source's full segment list as-is — walking back through any
   * chain of "same as previous" draft rows, and for the very first row,
   * falling back to `previousRow.segments` (the screen's real last saved
   * row) when given — so gaps in the source row are preserved, not filled.
   */
  const effectiveRows = useMemo(() => {
    const resolved = [];
    draftRows.forEach((r, idx) => {
      const sourceSegments =
        idx > 0 ? resolved[idx - 1]?.segments : previousRow?.segments;
      if (r.sameAsPrevious && sourceSegments) {
        resolved.push({ ...r, segments: sourceSegments });
      } else {
        resolved.push({
          ...r,
          segments: [
            {
              seatType: r.seatType,
              startNumber: Number(r.startNumber),
              count: Number(r.count),
            },
          ],
        });
      }
    });
    return resolved;
  }, [draftRows, previousRow]);

  const validRows = useMemo(
    () =>
      effectiveRows.filter(
        (r) =>
          /^[A-Z]{1,3}$/.test(r.row) &&
          r.segments.length > 0 &&
          r.segments.every(
            (seg) => seg.startNumber >= 1 && seg.count >= 1 && seg.count <= 100,
          ),
      ),
    [effectiveRows],
  );

  const previewSeats = useMemo(() => {
    const seats = [];
    for (const r of validRows) {
      for (const seg of r.segments) {
        for (let i = 0; i < seg.count; i++) {
          seats.push({
            row: r.row,
            number: seg.startNumber + i,
            type: seg.seatType,
            status: "AVAILABLE",
          });
        }
      }
    }
    return seats;
  }, [validRows]);

  function handleSubmit(e) {
    e.preventDefault();
    if (validRows.length === 0) return;
    onSubmit(
      validRows.flatMap((r) =>
        r.segments.map((seg) => ({
          row: r.row,
          seatType: seg.seatType,
          startNumber: seg.startNumber,
          count: seg.count,
        })),
      ),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError message={error} />

      <div className="flex flex-col gap-3">
        {draftRows.map((r, idx) => {
          const effective = effectiveRows[idx];
          const hasPrevious = idx > 0 || Boolean(previousRow);
          const usingPrevious = hasPrevious && r.sameAsPrevious;
          const totalSeats = effective.segments.reduce(
            (sum, seg) => sum + seg.count,
            0,
          );

          return (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-md border border-hairline p-3"
            >
              <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[5.5rem_1fr_auto]">
                <FormField
                  id={`row-letter-${r.id}`}
                  label="Row"
                  value={r.row}
                  onChange={(e) =>
                    updateRow(r.id, "row", e.target.value.toUpperCase())
                  }
                  maxLength={3}
                  placeholder="A"
                />
                {hasPrevious && (
                  <label className="flex items-center gap-2 pb-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={r.sameAsPrevious}
                      onChange={() => toggleSameAsPrevious(r.id)}
                      className="h-4 w-4 rounded border-hairline text-velvet focus:ring-1 focus:ring-velvet"
                    />
                    Same seat numbers as previous row
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => removeDraftRow(r.id)}
                  disabled={draftRows.length === 1}
                  className="col-span-2 justify-self-end rounded-md px-2 py-2 text-sm font-medium text-mist transition-colors hover:text-velvet disabled:cursor-not-allowed disabled:opacity-30 sm:col-span-1 sm:mb-1 sm:justify-self-auto"
                  aria-label="Remove row"
                >
                  ✕ Remove
                </button>
              </div>

              {usingPrevious ? (
                <p className="text-sm text-mist">
                  {effective.segments.length === 1
                    ? `${formatSeatType(effective.segments[0].seatType)} · seats ${effective.segments[0].startNumber}–${
                        effective.segments[0].startNumber +
                        effective.segments[0].count -
                        1
                      }`
                    : `${totalSeats} seats across ${effective.segments.length} segments (same gaps as the row above)`}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label
                      htmlFor={`row-type-${r.id}`}
                      className="mb-1.5 block text-base font-medium text-ink sm:text-lg"
                    >
                      Seat type
                    </label>
                    <select
                      id={`row-type-${r.id}`}
                      value={r.seatType}
                      onChange={(e) =>
                        updateRow(r.id, "seatType", e.target.value)
                      }
                      className="w-full rounded-md border border-hairline bg-surface px-3 py-3 text-base text-ink focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
                    >
                      {SEAT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {formatSeatType(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormField
                    id={`row-start-${r.id}`}
                    label="Start #"
                    type="number"
                    min="1"
                    value={r.startNumber}
                    onChange={(e) =>
                      updateRow(r.id, "startNumber", e.target.value)
                    }
                  />
                  <FormField
                    id={`row-count-${r.id}`}
                    label="Count"
                    type="number"
                    min="1"
                    max="100"
                    value={r.count}
                    onChange={(e) => updateRow(r.id, "count", e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="self-start text-sm font-medium text-velvet hover:underline"
      >
        + Add row
      </button>

      <div className="rounded-md border border-hairline bg-paper p-4">
        <SeatGrid seats={previewSeats} />
      </div>

      <Button
        pending={pending}
        disabled={pending || validRows.length === 0}
        className="w-full"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
