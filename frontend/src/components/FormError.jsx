/**
 * Top-of-form error banner for submit-level failures that aren't tied to
 * one specific field (wrong credentials, duplicate email, server errors).
 *
 * @param {{ message?: string }} props - renders nothing if message is falsy.
 */
export default function FormError({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-md border border-velvet/20 bg-velvet/10 px-4 py-3 text-sm text-velvet"
    >
      {message}
    </div>
  );
}
