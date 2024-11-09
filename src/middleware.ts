import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;

    // Skip middleware for API routes and static files
    if (
      path.startsWith("/api") ||
      path.startsWith("/_next") ||
      path.includes("/favicon.ico")
    ) {
      return NextResponse.next();
    }

    const session = await auth();
    const isAuthPage = path.startsWith("/auth");

    // Redirect authenticated users away from auth pages
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users to signin
    if (!session && !isAuthPage) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    // Log error but don't fail
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
