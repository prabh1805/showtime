import { Link } from "react-router-dom";

/** Catch-all 404 for unmatched routes. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">404</h1>
      <p className="text-mist">This page doesn&apos;t exist.</p>
      <Link
        to="/"
        className="text-sm font-medium text-velvet underline-offset-4 hover:underline"
      >
        Back home
      </Link>
    </main>
  );
}
