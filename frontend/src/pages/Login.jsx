import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import FormField from "../components/FormField";
import Button from "../components/Button";
import FormError from "../components/FormError";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { roleHomePath } from "../lib/roles";

/**
 * Login page for all roles (Customer/Owner/Staff/Admin) — the same form
 * works for everyone since the backend doesn't scope login by role. After
 * a successful login, the user is routed to their role's dashboard.
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const registeredState = location.state?.registered;
  const prefillEmail = location.state?.email ?? "";

  const [values, setValues] = useState({ email: prefillEmail, password: "" });
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
   * Calls auth.login, then navigates to wherever the user was headed
   * before being redirected to /login (location.state.from, set by
   * ProtectedRoute), falling back to their role's dashboard via
   * roleHomePath. On failure, surfaces the error via FormError — per the
   * backend contract, 401s always carry the generic message "Unauthorized"
   * regardless of the actual cause.
   * @param {import("react").FormEvent} e
   */
  async function handleSubmit(e) {
    // TODO: e.preventDefault(); setFormError(""); setPending(true);
    // try {
    //   const { role } = await auth.login(values.email, values.password);
    //   const redirectTo = location.state?.from?.pathname ?? roleHomePath(role);
    //   navigate(redirectTo, { replace: true });
    // } catch (err) {
    //   setFormError(err instanceof ApiError ? err.body?.message : "Something went wrong.");
    // } finally {
    //   setPending(false);
    // }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 py-12 text-center">
      <Logo />

      <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
        <h1 className="text-center font-display text-2xl font-bold tracking-wide text-ink">
          Log in
        </h1>
        <p className="mt-1 text-center text-sm text-mist">
          Welcome back — let&apos;s get you to your seats.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          {registeredState && (
            <div
              role="status"
              className="rounded-md border border-marquee/30 bg-marquee/10 px-4 py-3 text-sm text-marquee"
            >
              Account created — log in to continue.
            </div>
          )}

          <FormError message={formError} />

          <FormField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            autoComplete="email"
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange("password")}
            autoComplete="current-password"
          />

          <Button pending={pending} className="mt-2 w-full">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-mist">
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-velvet underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
