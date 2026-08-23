const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

/**
 * Common inline spinner icon — the single source of "loading" visuals across
 * the app (buttons, tables, panels). Color follows `currentColor`, so it
 * inherits whatever text color its container sets.
 *
 * @param {Object} props
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 * @param {string} [props.className=""] - extra classes (e.g. margin, color override).
 */
export default function Spinner({ size = "md", className = "" }) {
  return (
    <svg
      className={`animate-spin ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/**
 * Centered spinner + label, for replacing a whole region's content while it
 * loads (a table body, a panel, a page section) — the block-level counterpart
 * to the bare `Spinner` icon used inline in buttons.
 *
 * @param {Object} props
 * @param {string} [props.label="Loading…"]
 * @param {string} [props.className=""]
 */
export function LoadingBlock({ label = "Loading…", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-8 text-mist ${className}`}
    >
      <Spinner size="lg" className="text-velvet" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
