import { useEffect } from "react";

/**
 * Centered overlay dialog. Closes on Escape, backdrop click, or the header
 * close button — unless `closeDisabled` (e.g. a submit in flight). Locks
 * body scroll while open. Renders nothing when `open` is false.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {import("react").ReactNode} props.children
 * @param {boolean} [props.closeDisabled=false]
 * @param {string} [props.maxWidthClassName="max-w-md"] - Tailwind max-width
 *   class for the dialog panel; pass a wider one (e.g. "max-w-2xl") for
 *   content that needs more horizontal room, like multi-column forms.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  closeDisabled = false,
  maxWidthClassName = "max-w-md",
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === "Escape" && !closeDisabled) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeDisabled, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-full w-full overflow-y-auto rounded-lg border border-hairline bg-surface p-6 shadow-lg sm:p-8 ${maxWidthClassName}`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-wide text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => !closeDisabled && onClose()}
            disabled={closeDisabled}
            aria-label="Close"
            className="rounded-md p-1 text-mist transition-colors hover:text-velvet disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
