import Spinner from "./Spinner";

/**
 * Primary action button with a built-in pending state, so forms don't
 * have to hand-roll "Submitting…" text/disabling logic.
 *
 * @param {Object} props
 * @param {import("react").ReactNode} props.children - label shown when not pending.
 * @param {boolean} [props.pending=false] - disables the button and swaps the label.
 * @param {string} [props.pendingLabel="Submitting…"] - label shown while pending.
 * @param {"submit"|"button"} [props.type="submit"]
 * @param {string} [props.className=""] - extra classes.
 */
export default function Button({
  children,
  pending = false,
  pendingLabel = "Submitting…",
  type = "submit",
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-velvet px-5 py-3 text-base font-medium text-paper transition-colors hover:bg-velvet-soft focus:outline-none focus:ring-2 focus:ring-velvet-soft disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3.5 sm:text-lg ${className}`}
      {...rest}
    >
      {pending && <Spinner size="sm" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
