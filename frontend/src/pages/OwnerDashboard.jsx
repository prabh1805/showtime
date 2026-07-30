import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

/**
 * Owner dashboard — WIP. A real "my theater details" view needs an
 * owner-scoped theater lookup endpoint that doesn't exist on the backend
 * yet (GET /api/v1/theaters only filters by city, and login doesn't
 * return a theaterId), so this is a stub until that's built.
 */
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();

  /** Logs out and returns to the login page. */
  function handleLogout() {
    auth.logout();
    navigate("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
      <Logo />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
          Owner dashboard — coming soon
        </h1>
        <p className="mt-2 max-w-sm text-mist">
          Your theater details will show up here once the backend supports
          looking them up by owner.
        </p>
      </div>
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
