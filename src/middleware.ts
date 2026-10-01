import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/api/auth/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
