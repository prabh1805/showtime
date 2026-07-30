import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

/**
 * Staff dashboard — WIP. The backend has exception classes hinting at an
 * add-staff-to-theater feature (DuplicateStaffException,
 * UnauthorizedTheaterAccessException, UserAlreadyHasRoleException) but no
 * @RestController for it yet, so there's nothing to build against.
 */
export default function StaffDashboard() {
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
          Staff dashboard — coming soon
        </h1>
        <p className="mt-2 max-w-sm text-mist">
          This is a placeholder until the backend exposes staff-management
          endpoints.
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
