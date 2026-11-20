import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Host-based routing:
 *   admin.baristajobs.so  -> the admin panel only (the public site is not served there)
 *   baristajobs.so        -> the public site only (/admin and /api/admin are not served there)
 *
 * Local development (localhost, 127.0.0.1, *.localhost) keeps working on one host:
 * the panel stays at /admin. `admin.localhost:3000` behaves like the production admin host.
 * Override the admin host with the ADMIN_HOST environment variable.
 */
const ADMIN_HOST = (process.env.ADMIN_HOST ?? "admin.baristajobs.so").toLowerCase();

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname.endsWith(".localhost");
}

export function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname, search } = request.nextUrl;

  const onAdminHost = hostname === ADMIN_HOST.split(":")[0] || hostname.startsWith("admin.");

  if (onAdminHost) {
    // Admin app, its API and framework assets are served as-is.
    if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    // Everything else maps into the admin app: "/" -> /admin, "/login" -> /admin/login ...
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isLocalHost(hostname)) return NextResponse.next();

  // Public host: keep the panel off it entirely.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const rest = pathname.slice("/admin".length) || "/";
    return NextResponse.redirect(new URL(`${rest}${search}`, `https://${ADMIN_HOST}`), 308);
  }
  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Skip framework internals and static files (anything with a file extension).
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
