import { useMemo } from "react";

const SEAT_TYPE_STYLES = {
  REGULAR: "border-hairline bg-surface text-ink",
  PREMIUM: "border-marquee/40 bg-marquee/15 text-marquee",
  RECLINER: "border-velvet/40 bg-velvet/15 text-velvet",
};

const BROKEN_STYLES = "border-hairline bg-hairline/40 text-mist line-through";

/**
 * Renders a screen's seat map as an actual grid diagram: a "screen this
 * way" banner, then each row as seat cells 1..max(number), with any number
 * missing from that row's seats rendered as a blank aisle gap. Pure
 * presentational — feed it either real persisted seats (from the API) or
 * synthetic draft seats (from `ScreenLayoutBuilder`'s live preview).
 * REMOVED seats are treated as gaps (they're soft-deleted).
 *
 * @param {{ seats: Array<{id?: number, row: string, number: number, type: string, status?: string}>, onSeatClick?: (seat: object) => void }} props
 */
export default function SeatGrid({ seats, onSeatClick }) {
  const rows = useMemo(() => {
    const byRow = new Map();
    for (const seat of seats) {
      if (seat.status === "REMOVED") continue;
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
  }, [seats]);

  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-hairline px-4 py-8 text-center text-sm text-mist">
        No seats yet.
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

      {/*
        overflow-x-auto + mx-auto (not items-center) so wide rows start
        scrolled to their left edge — a centered flex item that overflows
        its scroll container starts scrolled to the MIDDLE of its content,
        hiding the first seats and the row label.
      */}
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
                      key={seat.id ?? `${row}-${index}`}
                      seat={seat}
                      onClick={onSeatClick}
                    />
                  ) : (
                    <span
                      key={`gap-${row}-${index}`}
                      className="h-6 w-6 shrink-0"
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-mist">
        <LegendSwatch swatchClassName={SEAT_TYPE_STYLES.REGULAR} label="Regular" />
        <LegendSwatch swatchClassName={SEAT_TYPE_STYLES.PREMIUM} label="Premium" />
        <LegendSwatch swatchClassName={SEAT_TYPE_STYLES.RECLINER} label="Recliner" />
        <LegendSwatch swatchClassName={BROKEN_STYLES} label="Broken" />
      </div>
    </div>
  );
}

function SeatCell({ seat, onClick }) {
  const styles =
    seat.status === "BROKEN"
      ? BROKEN_STYLES
      : (SEAT_TYPE_STYLES[seat.type] ?? SEAT_TYPE_STYLES.REGULAR);
  const className = `flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] font-medium ${styles} ${
    onClick ? "cursor-pointer transition-transform hover:scale-110" : ""
  }`;

  if (!onClick) {
    return <div className={className}>{seat.number}</div>;
  }
  return (
    <button
      type="button"
      onClick={() => onClick(seat)}
      className={className}
      title={`${seat.row}${seat.number} — ${seat.type}${seat.status === "BROKEN" ? " (broken)" : ""}`}
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
