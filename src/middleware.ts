import { NextResponse, type NextRequest } from "next/server";

// VPG 2026 was cancelled and the Supabase project is no longer running, so
// logins and every data-backed page are switched off: anything other than the
// static home page redirects to "/". The old pages are left in the codebase
// (unreachable) in case a future gathering revives them; restoring access means
// bringing back the updateSession() call from @/lib/supabase/middleware.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|json)$).*)",
  ],
};
