import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import FormField from "../components/FormField";
import Button from "../components/Button";
import FormError from "../components/FormError";
import { register } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { roleHomePath } from "../lib/roles";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  mapFieldErrors,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "../lib/validators";

/**
 * Customer registration page. Self-service registration always creates a
 * CUSTOMER account (the backend hardcodes this role) — Owner/Staff/Admin
 * accounts are provisioned separately and aren't created here.
 */
export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  /**
   * Returns a change handler for a given field name, updating `values`
   * from the input's current value.
   * @param {keyof typeof values} field
   * @returns {(e: import("react").ChangeEvent<HTMLInputElement>) => void}
   */
  function handleChange(field) {
    // TODO: return (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  /**
   * Runs client-side validation against `values` (firstName/lastName/email
   * required, email format, password strength — mobileNumber has no rules).
   * Populates `errors` via setErrors.
   * @returns {boolean} true if there are no validation errors.
   */
  function validate() {
    // TODO: build an errors object using validateRequired/validateEmail/
    // validatePassword, setErrors(errorsObj), return Object.keys(errorsObj).length === 0.
  }

  /**
   * Validates, calls the register API, then immediately chains a login
   * call with the same credentials so the user lands on their dashboard
   * already authenticated (register itself returns no tokens, so this is
   * a second round-trip). Maps register's 400 field errors onto per-field
   * state; surfaces 409 (duplicate email) and anything else via the
   * top-level FormError banner.
   *
   * If register succeeds but the follow-up login call fails for any
   * reason (edge case — e.g. a transient network error), fall back to
   * /login with a success banner + prefilled email rather than stranding
   * the user on an error with an account that already exists.
   *
   * @param {import("react").FormEvent} e
   */
  async function handleSubmit(e) {
    // TODO: e.preventDefault(); setFormError(""); if (!validate()) return;
    // setPending(true);
    // try {
    //   await register({ ...values, mobileNumber: values.mobileNumber || undefined });
    // } catch (err) {
    //   setPending(false);
    //   if (err instanceof ApiError && err.status === 400) {
    //     setErrors(mapFieldErrors(err.body?.fieldErrors));
    //   } else {
    //     setFormError(err instanceof ApiError ? err.body?.message : "Something went wrong.");
    //   }
    //   return;
    // }
    //
    // try {
    //   const { role } = await auth.login(values.email, values.password);
    //   navigate(roleHomePath(role), { replace: true });
    // } catch {
    //   navigate("/login", { state: { registered: true, email: values.email } });
    // } finally {
    //   setPending(false);
    // }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 py-12 text-center">
      <Logo />

      <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
        <h1 className="text-center font-display text-2xl font-bold tracking-wide text-ink">
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-mist">
          Book shows in a few taps.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <FormError message={formError} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="firstName"
              label="First name"
              value={values.firstName}
              onChange={handleChange("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <FormField
              id="lastName"
              label="Last name"
              value={values.lastName}
              onChange={handleChange("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
            />
          </div>

          <FormField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            error={errors.email}
            autoComplete="email"
          />

          <div>
            <FormField
              id="password"
              label="Password"
              type="password"
              value={values.password}
              onChange={handleChange("password")}
              error={errors.password}
              autoComplete="new-password"
            />
            <p className="mt-1.5 text-xs text-mist">
              {PASSWORD_REQUIREMENTS_MESSAGE}
            </p>
          </div>

          <FormField
            id="mobileNumber"
            label="Mobile number (optional)"
            type="tel"
            value={values.mobileNumber}
            onChange={handleChange("mobileNumber")}
            error={errors.mobileNumber}
            autoComplete="tel"
          />

          <Button pending={pending} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-mist">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-velvet underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
