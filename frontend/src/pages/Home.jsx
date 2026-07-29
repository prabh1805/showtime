import { Link } from "react-router-dom";
import Logo from "../components/Logo";

/**
 * Temporary landing placeholder. Will become the real show-discovery
 * homepage later; for now it just links into the auth routes for testing.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <Logo />
      <p className="max-w-sm text-mist">
        Home page placeholder. The real show-discovery homepage comes later.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="rounded-md border border-velvet px-4 py-2 text-sm font-medium text-velvet hover:bg-velvet hover:text-paper transition-colors"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="rounded-md bg-velvet px-4 py-2 text-sm font-medium text-paper hover:bg-velvet-soft transition-colors"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
