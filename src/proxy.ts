import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";

export const proxy = async (request: NextRequest) => {
  const sessionIsValid = await verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (sessionIsValid) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "No autorizado" },
      { status: 401 },
    );
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
};

export const config = {
  matcher: ["/admin/leads/:path*", "/api/admin/leads/:path*"],
};
