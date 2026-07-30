import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

/**
 * Customer dashboard — WIP. This is where the real show-discovery
 * homepage will eventually live; for now it just confirms the
 * register/login/role-routing flow works end to end.
 */
export default function CustomerDashboard() {
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
          Welcome — coming soon
        </h1>
        <p className="mt-2 max-w-sm text-mist">
          Show discovery and booking will live here. For now, this
          confirms you're logged in as a customer.
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
