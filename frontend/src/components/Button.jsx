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
      className={`inline-flex items-center justify-center rounded-md bg-velvet px-4 py-2 font-medium text-paper transition-colors hover:bg-velvet-soft focus:outline-none focus:ring-2 focus:ring-velvet-soft disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
