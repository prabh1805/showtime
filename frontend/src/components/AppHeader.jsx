import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";

/**
 * Shared full-bleed app header: logo left, profile avatar/dropdown right.
 * Designed to span the full viewport width — pages using it should NOT add
 * their own horizontal page padding to the `<main>` wrapping it; put page
 * content below it in its own padded container instead.
 */
export default function AppHeader() {
  return (
    <header className="flex w-full justify-center border-b border-hairline bg-surface px-6 py-4">
      <div className="flex w-full max-w-5xl items-center justify-between gap-4">
        <Logo />
        <ProfileMenu />
      </div>
    </header>
  );
}
