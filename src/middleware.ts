import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith("/api/auth");
  if (isAuthPage) return NextResponse.next();
  return NextResponse.redirect(new URL("/api/auth/signin", request.url));
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
