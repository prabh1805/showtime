/**
 * Showtime brand mark — "Spotlight Play": a play glyph catching a projector
 * beam. Icon-only by default; pass `withWordmark` to append the "SHOWTIME"
 * wordmark (used in headers/nav). Purely presentational, no state or logic.
 *
 * @param {Object} props
 * @param {boolean} [props.withWordmark=true] - Show the "SHOWTIME" text next to the mark.
 * @param {string} [props.className] - Extra classes for the wrapping element (e.g. sizing overrides).
 */
export default function Logo({ withWordmark = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="h-9 w-9 shrink-0"
        role={withWordmark ? "presentation" : "img"}
        aria-hidden={withWordmark ? "true" : undefined}
        aria-label={withWordmark ? undefined : "Showtime"}
      >
        <circle cx="50" cy="50" r="48" fill="#8C2D3F" />
        <polygon
          points="38,30 38,70 40,70 76,52 76,48 40,30"
          fill="#FAF7F0"
          opacity="0.16"
        />
        <path d="M42 34 L42 66 L70 50 Z" fill="#FAF7F0" />
      </svg>
      {withWordmark && (
        <span className="font-display text-xl font-bold tracking-wide text-ink">
          SHOWTIME
        </span>
      )}
    </span>
  );
}
