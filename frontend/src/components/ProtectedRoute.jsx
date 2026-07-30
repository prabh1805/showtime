import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHomePath } from "../lib/roles";

/**
 * Gates a route by auth status and role. Shows a loading state while the
 * on-mount session check is still in flight, redirects unauthenticated
 * visitors to /login (preserving where they were headed), and redirects
 * authenticated-but-wrong-role visitors to their own dashboard.
 *
 * @param {{ allowedRoles: string[], children: import("react").ReactNode }} props
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { status, role } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
        <p className="text-mist">Checking your session…</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return children;
}
