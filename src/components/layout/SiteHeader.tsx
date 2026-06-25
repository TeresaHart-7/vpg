import Link from "next/link";
import { Leaf } from "@phosphor-icons/react/dist/ssr";

export function SiteHeader({ showNav = true }: { showNav?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-lavender-100 bg-cream-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="text-plum-500" size={24} weight="duotone" />
          <span className="font-display text-display-sm text-lavender-800">
            Village Playground
          </span>
        </Link>
        {showNav && (
          <nav className="flex items-center gap-4">
            <Link
              href="/#about"
              className="hidden text-body-md text-ink-600 hover:text-plum-500 sm:inline"
            >
              About villaging
            </Link>
            <Link
              href="/login"
              className="text-body-md font-semibold text-plum-500 hover:text-plum-700"
            >
              Log in
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-lavender-100 bg-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="font-display text-display-sm text-lavender-800">
          Village Playground
        </p>
        <p className="mt-2 text-body-md text-ink-600">
          Sept 25–29, 2026 · Camp Ki-Wa-Y, near Waterloo, ON
        </p>
        <p className="mt-4 text-body-sm text-ink-600">
          <a href="#about" className="text-teal-600 hover:underline">
            About villaging
          </a>
        </p>
      </div>
    </footer>
  );
}
