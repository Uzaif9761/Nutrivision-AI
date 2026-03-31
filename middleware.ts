import { type NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // Middleware that simply passes through all requests
  // Auth is handled on the client side and in API routes
  // This prevents middleware invocation failures while maintaining security
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
