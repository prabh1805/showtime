import { Link } from "react-router-dom";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../context/useAuth";
import { roleHomePath } from "../lib/roles";

/**
 * Shared full-bleed app header: logo left (links back to the signed-in
 * user's dashboard — the one way back from pages like Profile that don't
 * otherwise have a "back" affordance), profile avatar/dropdown right.
 * Designed to span the full viewport width — pages using it should NOT add
 * their own horizontal page padding to the `<main>` wrapping it; put page
 * content below it in its own padded container instead.
 */
export default function AppHeader() {
  const { role } = useAuth();

  return (
    <header className="flex w-full justify-center border-b border-hairline bg-surface px-6 py-4">
      <div className="flex w-full max-w-5xl items-center justify-between gap-4">
        <Link to={roleHomePath(role)} aria-label="Go to your dashboard">
          <Logo />
        </Link>
        <ProfileMenu />
      </div>
    </header>
  );
}
