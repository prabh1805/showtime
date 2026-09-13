import { useMemo } from "react";

const CATEGORY_STYLES = {
  REGULAR: "border-hairline bg-surface text-ink",
  PREMIUM: "border-marquee/40 bg-marquee/15 text-marquee",
  RECLINER: "border-velvet/40 bg-velvet/15 text-velvet",
};

const UNAVAILABLE_STYLES = "border-hairline bg-hairline/40 text-mist";
const SELECTED_STYLES = "border-velvet bg-velvet text-paper";

/**
 * Seat-map diagram for picking seats to book. Same row/gap layout as
 * `SeatGrid.jsx`, but keyed to `ShowSeatResponse`'s shape: `showSeatId`,
 * `category` (REGULAR/PREMIUM/RECLINER), `status` (AVAILABLE/LOCKED/BOOKED),
 * `price`. AVAILABLE seats toggle selection on click; LOCKED/BOOKED seats
 * are disabled. Pure presentational — the page owns `selectedIds`.
 *
 * @param {{
 *   showSeats: Array<{ showSeatId: number, row: string, number: number, category: string, price: number, status: string }>,
 *   selectedIds: Set<number>,
 *   onToggle: (seat: object) => void,
 * }} props
 */
export default function BookingSeatGrid({ showSeats, selectedIds, onToggle }) {
  const rows = useMemo(() => {
    const byRow = new Map();
    for (const seat of showSeats) {
      if (!byRow.has(seat.row)) byRow.set(seat.row, []);
      byRow.get(seat.row).push(seat);
    }
    return [...byRow.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, rowSeats]) => {
        const byNumber = new Map(rowSeats.map((s) => [s.number, s]));
        const numbers = rowSeats.map((s) => s.number);
        const minNumber = Math.min(...numbers);
        const maxNumber = Math.max(...numbers);
        const cells = [];
        for (let n = minNumber; n <= maxNumber; n++) {
          cells.push(byNumber.get(n) ?? null);
        }
        return { row, startNumber: minNumber, cells };
      });
  }, [showSeats]);

  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-hairline px-4 py-8 text-center text-sm text-mist">
        No seats available for this show.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center">
        <div className="h-2 w-full max-w-md rounded-t-full bg-linear-to-b from-mist/40 to-transparent" />
      </div>
      <p className="text-center text-xs font-medium uppercase tracking-widest text-mist">
        Screen this way
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-fit flex-col gap-1.5">
          {rows.map(({ row, startNumber, cells }) => (
            <div key={row} className="flex items-center gap-1.5">
              <span
                className="w-9 shrink-0 text-right text-xs font-medium text-mist"
                title={
                  startNumber === 1
                    ? `Row ${row}`
                    : `Row ${row} starts at seat ${startNumber}`
                }
              >
                {row}
                {startNumber !== 1 && (
                  <span className="text-mist/60"> {startNumber}</span>
                )}
              </span>
              <div className="flex gap-1">
                {cells.map((seat, index) =>
                  seat ? (
                    <SeatCell
                      key={seat.showSeatId}
                      seat={seat}
                      selected={selectedIds.has(seat.showSeatId)}
                      onToggle={onToggle}
                    />
                  ) : (
                    <span key={`gap-${row}-${index}`} className="h-6 w-6 shrink-0" />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-mist">
        <LegendSwatch swatchClassName={CATEGORY_STYLES.REGULAR} label="Regular" />
        <LegendSwatch swatchClassName={CATEGORY_STYLES.PREMIUM} label="Premium" />
        <LegendSwatch swatchClassName={CATEGORY_STYLES.RECLINER} label="Recliner" />
        <LegendSwatch swatchClassName={SELECTED_STYLES} label="Selected" />
        <LegendSwatch swatchClassName={UNAVAILABLE_STYLES} label="Taken" />
      </div>
    </div>
  );
}

function SeatCell({ seat, selected, onToggle }) {
  const isAvailable = seat.status === "AVAILABLE";
  const styles = selected
    ? SELECTED_STYLES
    : isAvailable
      ? (CATEGORY_STYLES[seat.category] ?? CATEGORY_STYLES.REGULAR)
      : UNAVAILABLE_STYLES;

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => onToggle(seat)}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] font-medium transition-transform ${styles} ${
        isAvailable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"
      }`}
      title={`${seat.row}${seat.number} — ${seat.category}, ₹${seat.price}${
        isAvailable ? "" : " (unavailable)"
      }`}
    >
      {seat.number}
    </button>
  );
}

function LegendSwatch({ swatchClassName, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded border ${swatchClassName}`} />
      {label}
    </span>
  );
}
