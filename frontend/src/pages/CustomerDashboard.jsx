import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useAuth } from "../context/useAuth";

/**
 * Customer dashboard — no show-discovery UI exists yet (no backend endpoint
 * to browse shows by movie/city), so this is a stopgap: enter a known show
 * id directly to jump to its seat map. Real discovery is future work.
 */
export default function CustomerDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showId, setShowId] = useState("");

  /** Logs out and returns to the login page. */
  function handleLogout() {
    auth.logout();
    navigate("/login");
  }

  function handleFindSeats(e) {
    e.preventDefault();
    if (showId.trim()) navigate(`/shows/${showId.trim()}/book`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <Logo />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
          Welcome — coming soon
        </h1>
        <p className="mt-2 max-w-sm text-mist">
          Show discovery is still being built. If you already know a show's
          id, you can jump straight to booking it below.
        </p>
      </div>

      <form
        onSubmit={handleFindSeats}
        className="flex w-full max-w-xs items-center gap-2"
      >
        <input
          type="text"
          inputMode="numeric"
          value={showId}
          onChange={(e) => setShowId(e.target.value)}
          placeholder="Show ID"
          className="w-full rounded-md border border-hairline bg-surface px-4 py-2.5 text-base text-ink placeholder:text-mist focus:border-velvet focus:outline-none focus:ring-1 focus:ring-velvet"
        />
        <Button type="submit" disabled={!showId.trim()} className="w-auto shrink-0">
          Go
        </Button>
      </form>

      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-velvet underline-offset-4 hover:underline"
      >
        Log out
      </button>
    </main>
  );
}
