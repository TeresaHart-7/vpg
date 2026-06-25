import Link from "next/link";
import {
  House,
  UserCircle,
  CreditCard,
  ShieldCheck,
  SignOut,
  BookOpen,
} from "@phosphor-icons/react/dist/ssr";
import { getCurrentProfile } from "@/lib/auth/helpers";

export async function AppNav() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-lavender-100 bg-cream-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="font-display text-display-sm text-lavender-800">
          Village Playground
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/dashboard" icon={<House size={18} />}>
            Home
          </NavLink>
          <NavLink href="/guide" icon={<BookOpen size={18} />}>
            Guide
          </NavLink>
          <NavLink href="/register" icon={<UserCircle size={18} />}>
            Registration
          </NavLink>
          <NavLink href="/payment" icon={<CreditCard size={18} />}>
            Payment
          </NavLink>
          {profile?.is_admin && (
            <NavLink href="/admin" icon={<ShieldCheck size={18} />}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-body-sm text-ink-600 sm:inline">
            {profile?.name || "Guest"}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-1 text-body-sm text-ink-600 hover:text-plum-500"
            >
              <SignOut size={18} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around rounded-t-xl border-t border-lavender-100 bg-white px-2 py-2 shadow-modal md:hidden">
        <MobileNavLink href="/dashboard" icon={<House size={22} />} label="Home" />
        <MobileNavLink href="/register" icon={<UserCircle size={22} />} label="Register" />
        <MobileNavLink href="/guide" icon={<BookOpen size={22} />} label="Guide" />
        <MobileNavLink href="/payment" icon={<CreditCard size={22} />} label="Payment" />
        {profile?.is_admin && (
          <MobileNavLink href="/admin" icon={<ShieldCheck size={22} />} label="Admin" />
        )}
      </nav>
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-pill px-4 py-2 text-body-sm font-semibold text-ink-600 hover:bg-plum-100 hover:text-plum-700"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 rounded-pill px-3 py-1 text-[11px] font-semibold text-ink-600"
    >
      {icon}
      {label}
    </Link>
  );
}
