/**
 * A labeled form input with an inline validation error slot. All extra
 * props (value, onChange, type overrides via `type`, placeholder, etc.)
 * are forwarded straight to the underlying <input>.
 *
 * @param {Object} props
 * @param {string} props.id - also used to associate the <label>.
 * @param {string} props.label - visible field label.
 * @param {string} [props.error] - validation message; renders nothing if absent.
 * @param {string} [props.type="text"] - native input type.
 * @param {string} [props.className=""] - extra classes for the wrapping <div>.
 */
export default function FormField({
  id,
  label,
  error,
  type = "text",
  className = "",
  ...inputProps
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-base font-medium text-ink sm:text-lg">
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-md border bg-surface px-4 py-3 text-base text-ink placeholder:text-mist focus:outline-none focus:ring-1 sm:text-lg ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-hairline focus:border-velvet focus:ring-velvet"
        }`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 sm:text-base">
          {error}
        </p>
      )}
    </div>
  );
}
