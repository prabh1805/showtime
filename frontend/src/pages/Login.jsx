import { Link } from "react-router-dom";
import Logo from "../components/Logo";

/**
 * Placeholder for the customer login page. Full form UI (fields,
 * validation, submit handling) is a separate, not-yet-built step.
 */
export default function Login() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <Logo />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
          Log in — coming soon
        </h1>
        <p className="mt-2 max-w-sm text-mist">
          The login form isn&apos;t built yet. This route is a placeholder so
          navigation can be tested end to end.
        </p>
      </div>
      <Link
        to="/register"
        className="text-sm font-medium text-velvet underline-offset-4 hover:underline"
      >
        New here? Create an account
      </Link>
    </main>
  );
}
