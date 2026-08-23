import { Link } from "react-router-dom";
import Logo from "../components/Logo";

/**
 * Temporary landing placeholder. Will become the real show-discovery
 * homepage later; for now it just links into the auth routes for testing.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper px-6 text-center sm:gap-10">
      <Logo />
      <p className="max-w-sm text-lg text-mist sm:max-w-md sm:text-xl lg:max-w-lg lg:text-2xl">
        Home page placeholder. The real show-discovery homepage comes later.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-5">
        <Link
          to="/login"
          className="rounded-md border border-velvet px-6 py-3.5 text-lg font-medium text-velvet hover:bg-velvet hover:text-paper transition-colors sm:px-8 sm:py-4 sm:text-xl"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="rounded-md bg-velvet px-6 py-3.5 text-lg font-medium text-paper hover:bg-velvet-soft transition-colors sm:px-8 sm:py-4 sm:text-xl"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
