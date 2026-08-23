import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { formatEnumLabel } from "../lib/format";

/**
 * Avatar button (top-right of AppHeader) that opens a dropdown with
 * "Profile" and "Log out". Self-contained: pulls the current user and
 * navigation from context/router directly, no props needed.
 */
export default function ProfileMenu() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e) {
      if (!containerRef.current?.contains(e.target)) setIsOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayName =
    auth.firstName && auth.lastName
      ? `${auth.firstName} ${auth.lastName}`
      : auth.email;
  const initials =
    auth.firstName && auth.lastName
      ? `${auth.firstName[0]}${auth.lastName[0]}`.toUpperCase()
      : (auth.email?.[0] ?? "?").toUpperCase();

  function handleLogout() {
    setIsOpen(false);
    auth.logout();
    navigate("/login");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-velvet text-sm font-semibold text-paper transition-colors hover:bg-velvet-soft focus:outline-none focus:ring-2 focus:ring-velvet-soft"
      >
        {initials}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-md border border-hairline bg-surface shadow-lg"
        >
          <div className="border-b border-hairline px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">
              {displayName}
            </p>
            <p className="text-xs text-mist">{formatEnumLabel(auth.role)}</p>
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-paper"
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-paper"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
