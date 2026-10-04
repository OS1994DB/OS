import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Housekeeping and cook accounts must not reach care records. Enforced here
// (server side) in addition to hiding the menu items.
const LIMITED_ROLES = ["HOUSEKEEPING", "COOK"];
const BLOCKED_PAGES = [
  "/dashboard/residents",
  "/dashboard/incidents",
  "/dashboard/audits",
  "/dashboard/messages",
  "/dashboard/services",
];
const BLOCKED_API = ["/api/residents", "/api/incidents"];

const under = (path: string, bases: string[]) => bases.some((b) => path === b || path.startsWith(b + "/"));

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isApi = pathname.startsWith("/api/");

  if (!token) {
    // API routes answer 401 themselves; pages go to the login screen.
    if (isApi) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?callbackUrl=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (LIMITED_ROLES.includes(token.role as string)) {
    if (isApi && under(pathname, BLOCKED_API)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!isApi && under(pathname, BLOCKED_PAGES)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/residents/:path*", "/api/incidents/:path*"],
};
